import { useRef, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { useUser } from '../context/UserContext';
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { toast } from "react-toastify";
import { HeartOff, ShoppingCart } from "lucide-react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { user } = useUser();
  const { addToCart, indianRupeeFormatter, parsePrice, toggleWishlist ,wishListProducts } = useShop();
  const navigate = useNavigate();
  const productRef = useRef(null);

  useEffect(() => {
    gsap.set(".wishlist-item", { opacity: 0, y: 20 });
    gsap.to(".wishlist-item", {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.3,
      ease: "power2.out"
    });
  }, [user?.wishlist]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`Added to Cart ${product.title} has been added to your cart`);
  };

  const handleToggleWishlist = (productId) => {
    toggleWishlist(productId);
    toast.success("Wishlist Updated Item removed from your wishlist");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </div>

      {wishListProducts?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishListProducts.map((product) => (
            <Card key={product} className="wishlist-item group relative hover:shadow-lg transition-shadow">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleToggleWishlist(product)}
              >
                <HeartOff className="h-5 w-5 text-destructive" />
              </Button>

              <Link to={`/product/${product}`}>
                <CardHeader className="pb-2">
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/images/${product}.webp`}
                    alt={product}
                    className="w-full h-48 object-contain rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">
                      {indianRupeeFormatter.format(parsePrice(product.price))}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-sm line-through text-muted-foreground">
                        {indianRupeeFormatter.format(parsePrice(product.oldPrice))}
                      </span>
                    )}
                  </div>
                  {product.discountPercentage > 0 && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </CardContent>
              </Link>

              <CardFooter className="flex justify-between">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <HeartOff className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
            <p className="text-muted-foreground">
              Start adding items you love by clicking the heart icon on products
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Explore Products
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Wishlist;
