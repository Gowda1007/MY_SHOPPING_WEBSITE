const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
    required: true
  }, 
  title: { 
    type: String, 
    required: [true, "Product title is required"] 
  },
  description: { type: String },
  category: { type: String },
  oldPrice: { 
    type: Number,
    min: [0, "Old price cannot be negative"],
    default: 0  
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"] 
  },
  discountPercentage: { 
    type: Number,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"]
  },
  rating: {
    type: Number,
    min: [0, "Rating cannot be negative"],
    max: [5, "Maximum rating is 5"]
  },
  stock: { 
    type: Number,
    min: [0, "Stock cannot be negative"] 
  },
  tags: { type: [String] }, 
  brand: { type: String },
  sku: { 
    type: String,
    unique: true,
    index: true
  },
  weight: { 
    type: Number,
    min: [0, "Weight cannot be negative"] 
  },
  dimensions: {
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    depth: { type: Number, min: 0 }
  },
  warrantyInformation: { type: String },
  availabilityStatus: { 
    type: String,
    enum: ["In Stock", "Out of Stock", "Pre-Order"],
    default: "In Stock"
  },
  reviews: [{
    rating: { type: Number, min: 0, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now },
    reviewerName: String,
    reviewerEmail: String
  }],
  minimumOrderQuantity: {
    type: Number,
    min: [1, "Minimum order must be at least 1"],
    default: 1
  },
  image: { type: String },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: [true, "Seller ID is required"] 
  },
}, { timestamps: true });


productSchema.set("toJSON", {
  transform: function (doc, ret) {
    
    if (typeof ret.price === "number") {
      ret.price = ret.price.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
      });
    } else {
      ret.price = "Price not available";
    }

    
    if (typeof ret.oldPrice === "number") {
      ret.oldPrice = ret.oldPrice.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
      });
    } else {
      ret.oldPrice = "Original price not shown";
    }

    
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    
    return ret;
  }
});

productSchema.set("toObject", {
  transform: function (doc, ret) {
    
    return this.toJSON.transform(doc, ret);
  }
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;