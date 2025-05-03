import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack
from datetime import datetime
from contextlib import contextmanager
from flask import Flask, jsonify, request
from flask_cors import CORS
import string

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:4000"])

# ==============================================
# MongoDB CONNECTION MANAGER
# ==============================================
@contextmanager
def mongo_connection():
    client = None
    try:
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
        db = client["My-Shop"]
        yield db
    finally:
        if client:
            client.close()

# ==============================================
# DATA FETCHING
# ==============================================
def fetch_realtime_data():
    """Fetch all required data from MongoDB collections"""
    with mongo_connection() as db:
        users = pd.DataFrame(list(db.users.find()))
        interactions = pd.DataFrame(list(db.interactions.find()))
        products = pd.DataFrame(list(db.products.find()))
    return users, interactions, products

def fetch_user_interactions(user_id):
    """Fetch interactions for a specific user"""
    with mongo_connection() as db:
        interactions = pd.DataFrame(list(db.interactions.find({"userId": user_id})))
    return interactions

# ==============================================
# DATA PREPROCESSING
# ==============================================
def convert_mongo_types(df, id_cols=[], date_cols=[]):
    """Convert MongoDB-specific data types to Python types"""
    for col in id_cols:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: str(x) if pd.notnull(x) else x)
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    return df

def create_text_features(df):
    """Combine text features into a single string"""
    text_components = []
    for col in ["subcategory", "tags", "brand", "title", "description", "sku", "category"]:
        if col == "tags":
            df[col] = df[col].apply(lambda x: ", ".join(map(str, x)) if isinstance(x, list) else "")
        df[col] = df[col].fillna("").astype(str).str.replace(r"[^\w\s]", "", regex=True)
        text_components.append(df[col])
    return text_components[0].str.cat(text_components[1:], sep=" ")

def preprocess_data():
    """Full data preprocessing pipeline"""
    users, interactions, products = fetch_realtime_data()
    
    # Convert MongoDB types
    users = convert_mongo_types(users, id_cols=['_id'], date_cols=[])
    interactions = convert_mongo_types(interactions, id_cols=['productId'], date_cols=['interactionDate'])
    products = convert_mongo_types(products, id_cols=['_id'], date_cols=[])
    
    # Clean unnecessary columns
    products.drop(columns=['dimensions','reviews','minimumOrderQuantity','image',
                          'warrantyInformation','weight','availabilityStatus'], 
                inplace=True, errors='ignore')
    users.drop(columns=['image','role','password','email','phone','__v'], 
             inplace=True, errors='ignore')

    # Flatten user carts/wishlists
    def flatten_user_products(users_df, list_type='cartProducts'):
        flattened = []
        for user in users_df.to_dict('records'):
            product_list = user.get(list_type, [])
            if not isinstance(product_list, list):
                continue
            for product in product_list:
                if not isinstance(product, dict):
                    continue
                flattened.append({
                    'user_id': user.get('_id'),
                    'username': user.get('username'),
                    'productId': product.get('_id'),
                    'quantity': product.get('quantity'),
                    'size': product.get('size'),
                    'type': 'cart' if list_type == 'cartProducts' else 'wishlist'
                })
        return pd.DataFrame(flattened)
    
    cart_flat = flatten_user_products(users, 'cartProducts')
    wish_flat = flatten_user_products(users, 'wishListProducts')
    user_products_df = pd.concat([cart_flat, wish_flat], ignore_index=True)
    
    # Merge all interaction data
    interactions.rename(columns={'userId': 'user_id'}, inplace=True)
    merged_interactions = pd.merge(
        user_products_df, 
        interactions, 
        how='outer', 
        on=['user_id', 'productId']
    )
    
    # Handle merged type columns
    merged_interactions['type'] = merged_interactions['type_x'].combine_first(merged_interactions['type_y'])  # Fix: Remove space in 'type_x'
    merged_interactions.drop(columns=['type_x', 'type_y'], inplace=True)
    merged_interactions['type'] = merged_interactions['type'].fillna('view')
    
    # Convert IDs to strings
    merged_interactions['productId'] = merged_interactions['productId'].astype(str)
    products['_id'] = products['_id'].astype(str)
    
    # Merge with product data (keep all products)
    final_df = pd.merge(
        merged_interactions,
        products,
        how='right',
        left_on='productId',
        right_on='_id'
    )
    
    # Clean merged columns
    final_df.drop(columns=[col for col in ['_id', '_id_x', '_id_y'] if col in final_df.columns], 
                inplace=True)
    
    # Handle missing values
    final_df.fillna({
        'user_id': 'no_user',
        'username': 'guest',
        'size': 'M',
        'quantity': 1,
        'interactionDate': datetime.now(),
        'type': 'no_interaction'
    }, inplace=True)
    
    # Create text features
    final_df['combined_text'] = create_text_features(final_df)
    
    return final_df

# ==============================================
# FEATURE ENGINEERING
# ==============================================
def safe_feature_scaling(df, features, prefix="scaled"):
    """Normalize numerical features with error handling"""
    valid_features = [f for f in features if f in df.columns]
    df_filled = df[valid_features].copy()
    
    for col in valid_features:
        df_filled[col] = pd.to_numeric(df_filled[col], errors="coerce").fillna(0)
    
    scaler = MinMaxScaler()
    scaled_array = scaler.fit_transform(df_filled)
    scaled_df = pd.DataFrame(scaled_array, columns=valid_features)
    
    # Apply custom weights
    weight_map = {"price": 0.5, "discountPercentage": 2.0, "rating": 3.0, "stock": 1.0}
    for col in scaled_df.columns:
        if col in weight_map:
            scaled_df[col] *= weight_map[col]
    
    return scaled_df.add_prefix(f"{prefix}_")

# ==============================================
# MODELING
# ==============================================
def realtime_similarity_engine(df, text_col="combined_text", num_cols=None):
    """Build recommendation model with prioritized text features"""
    # Text feature processing
    tfidf = TfidfVectorizer(
        stop_words="english",
        max_features=10000,
        ngram_range=(1, 3),
        min_df=2
    )
    tfidf_matrix = tfidf.fit_transform(df[text_col])
    
    # Numerical feature processing
    num_scaled = safe_feature_scaling(df, num_cols)
    
    # Combine features with enhanced text weighting
    text_weights = {
        'subcategory': 3.0,
        'category': 2.0,
        'tags': 1.5,
        'default': 1.2
    }
    
    # Apply weighted combination
    combined_features = hstack([
        tfidf_matrix * text_weights['default'],
        num_scaled
    ]).tocsr()
    
    # Build model
    n_neighbors = min(30, len(df) - 1)
    nn = NearestNeighbors(
        n_neighbors=n_neighbors + 1,
        metric="cosine",
        algorithm="brute"
    )
    nn.fit(combined_features)
    
    return nn, combined_features
# ==============================================
# RECOMMENDATION ENGINES
# ==============================================

def personalized_recommendations(user_id, df, top_n=10):
    """Generate personalized recommendations for a user"""
    # Get user interaction history
    interactions = fetch_user_interactions(user_id)
    
    if not interactions.empty:
        # Get interacted product IDs
        interacted_products = interactions['productId'].unique().tolist()
        
        # Filter out interacted products
        recommendations = df[~df['productId'].isin(interacted_products)]
        
        # Count interactions for the user
        interaction_counts = interactions.groupby('productId').size().reset_index(name='interaction_count')
        interaction_counts['productId'] = interaction_counts['productId'].astype(str)
        
        # Merge with recommendations to include interaction counts
        recommendations = recommendations.merge(
            interaction_counts,
            on='productId',
            how='left'
        ).fillna({'interaction_count': 0})  # Fill NaN with 0 for interaction counts
    else:
        recommendations = df.copy()
        recommendations['interaction_count'] = 0  # No interactions, set count to 0
    
    # Add interaction count-based scoring
    recommendations = recommendations.sort_values(
        by=['interaction_count', 'rating', 'discountPercentage'],
        ascending=[False, False, False]
    )
    
    return recommendations.head(top_n)['productId'].tolist()

def get_fallback_recommendations(df, top_n=10):
    """Improved fallback with random sampling and validation"""
    try:
        if df.empty:
            # Direct database fallback
            with mongo_connection() as db:
                products = list(db.products.aggregate([{ "$sample": { "size": top_n } }]))
                return [str(p['_id']) for p in products]
                
        valid_products = df['productId'].dropna().unique()
        if len(valid_products) >= top_n:
            return list(np.random.choice(valid_products, size=top_n, replace=False))
        return list(valid_products[:top_n])
        
    except Exception as e:
        print(f"Fallback error: {str(e)}")
        return []
    
def get_recommendations_for_product(product_id, model, feature_matrix, unique_products_df):
    """Fetch recommendations for a specific product"""
    try:
        product_index = unique_products_df[unique_products_df['productId'] == product_id].index[0]
        distances, indices = model.kneighbors(feature_matrix[product_index], n_neighbors=11)
        return unique_products_df.iloc[indices.flatten()[1:]]['productId'].tolist()
    except IndexError:
        return get_fallback_recommendations(unique_products_df)
    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        return []
# ==============================================
# FLASK ENDPOINTS
# ==============================================
@app.route('/recommendations/content/<product_id>', methods=['GET'])
def content_recommendations(product_id):
    """Endpoint for content-based recommendations"""
    try:
        data = request.json
        product_id = str(product_id)
        
        if not product_id:
            return jsonify({'error': 'product_id is required'}), 400

        # Fetch and preprocess data
        df = preprocess_data()
        
        # Find the product with the given product_id
        target_product = df[df['productId'] == product_id]
        
        if target_product.empty:
            return jsonify({'error': 'Product not found'}), 404

        # Get the subcategory and title of the target product
        target_subcategory = target_product['subcategory'].iloc[0]
        target_title = target_product['title'].iloc[0]
        target_tags = target_product['tags'].iloc[0] if 'tags' in target_product.columns else ""
        target_brand = target_product['brand'].iloc[0]

        # Step 1: Filter products by subcategory
        related_products = df[df['subcategory'] == target_subcategory]

        # Step 2: Calculate title similarity
        if not related_products.empty:
            # Create a TF-IDF vectorizer for title similarity
            tfidf_vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = tfidf_vectorizer.fit_transform(related_products['title'].tolist() + [target_title])
            
            # Calculate cosine similarity
            cosine_sim = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
            related_products['title_similarity'] = cosine_sim.flatten()

            # Sort by title similarity
            related_products = related_products.sort_values(by='title_similarity', ascending=False)

        # Step 3: Further filter by tags and brand
        if 'tags' in df.columns:
            related_products['tag_match'] = related_products['tags'].apply(lambda x: len(set(x) & set(target_tags)) > 0)
            related_products = related_products[related_products['tag_match'] | (related_products['brand'] == target_brand)]

        # Step 4: Prepare the response
        response = []
        for _, product in related_products.iterrows():
            product_info = {
                'productId': product['productId'],
                'title': product['title'],
                'price': product['price'],
                'discountPercentage': product['discountPercentage'],
                'rating': product['rating'],
                'stock': product['stock'],
                'subcategory': product['subcategory'],
                'category': product['category'],
                'brand': product['brand'],
                'sku': product['sku'],
                'title_similarity': product.get('title_similarity', 0)  
            }
            response.append(product_info)

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/recommendations/personalized/<user_id>', methods=['GET'])
def personalized_recommendations_endpoint(user_id):
    """Endpoint for personalized recommendations"""
    try:
        # Validate user_id format
        if not user_id or user_id.lower() in ['null', 'undefined', 'none']:
            return jsonify(get_fallback_recommendations(preprocess_data()))
            
        # Basic MongoDB ID format validation
        if len(user_id) != 24 or not all(c in string.hexdigits for c in user_id):
            return jsonify(get_fallback_recommendations(preprocess_data()))

        full_df = preprocess_data()
        
        # Safe interaction fetching
        interactions = fetch_user_interactions(user_id)
        if interactions.empty or 'productId' not in interactions.columns:
            return jsonify(get_fallback_recommendations(full_df))

        # Sanitize product IDs
        valid_products = full_df[full_df['productId'].notna()]
        recommendations = personalized_recommendations(user_id, valid_products)
        
        return jsonify(recommendations if recommendations else get_fallback_recommendations(full_df))

    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        return jsonify(get_fallback_recommendations(preprocess_data()))   

# ==============================================
# MAIN EXECUTION
# ==============================================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)