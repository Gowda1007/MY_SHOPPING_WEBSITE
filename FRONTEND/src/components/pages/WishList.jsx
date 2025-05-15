import { useRef, useEffect, useState } from "react";
import { useShop } from "../context/ShopContext";
import { useUser } from "../context/UserContext";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { toast } from "react-toastify";
import { HeartOff, ShoppingCart } from "lucide-react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/API";

const Wishlist = () => {
  const { user } = useUser();
  const {
    addToCart,
    toggleWishlist,
    wishListProducts,
    indianRupeeFormatter,
    parsePrice,
  } = useShop();
  const navigate = useNavigate();
  const productRef = useRef(null);
  const [wishlistData, setWishlistData] = useState([]);

  useEffect(() => {
    if (wishlistData?.length > 0) {
      gsap.set(".wishlist-item", { opacity: 0, y: 20 });
      gsap.to(".wishlist-item", {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [wishlistData]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const responses = await Promise.all(
          wishListProducts.map((id, i) =>
            API.get(`/products/wishlist/${id}`).then((res) => res.data)
          )
        );
        setWishlistData(responses.map((res) => res.product));
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
        toast.error("Failed to load wishlist products");
      }
    };

    if (wishListProducts.length > 0) {
      fetchWishlistProducts();
    } else {
      setWishlistData([]);
    }
  }, [wishListProducts]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <Button
          className="hover:text-white"
          variant="outline"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </Button>
      </div>

      {wishlistData?.length > 0 ? (
        <div
          ref={productRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {wishlistData.map((product) => (
            <Card
              key={product._id}
              className="wishlist-item  group relative hover:shadow-lg transition-shadow"
            >
              <Button
                variant="primary"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleToggleWishlist(product)}
              >
                <HeartOff className="h-5 w-5 text-destructive" />
              </Button>

              <Link to={`/product/${product._id}`}>
                <CardHeader className="pb-2">
                  <img
                    className="w-full h-48 object-contain rounded-t-lg"
                    src={`${import.meta.env.VITE_BASE_URL}/${product.image}`}
                    alt={product.title}
                    loading="lazy"
                    style={{
                      backgroundColor: "transparent",
                      aspectRatio: "1/1",
                    }}
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-sm font-semibold">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-green-400 font-bold">
                    {indianRupeeFormatter.format(parsePrice(product.price))}
                  </CardDescription>
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
            <Button onClick={() => navigate("/")} className="mt-4">
              Explore Products
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Wishlist;
