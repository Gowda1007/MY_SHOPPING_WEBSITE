import { useEffect, useState, useRef, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { Heart } from "lucide-react";
import { useShop } from "./context/ShopContext";
import { toast } from "react-toastify";

const ProductsGrid = ({ products, isLoading }) => {
  const { addToCart, toggleWishlist, wishListProducts } = useShop();
  const [isDelayComplete, setIsDelayComplete] = useState(false);
  const shimmerAnimation = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    if (isLoading || !isDelayComplete) {
      shimmerAnimation.current = gsap.timeline({ repeat: -1 });
      
      
      for (let i = 0; i < 5; i++) {
        shimmerAnimation.current.to(
          `.shimmer-container:nth-child(5n + ${i + 1}) .shimmer`,
          {
            x: "400%",
            duration: 1.5,
            ease: "power2.inOut",
            delay: i * 0.2,
          },
          i === 0 ? 0 : "-=1.3"
        );
      }
    }
    
    return () => {
      if (shimmerAnimation.current) {
        shimmerAnimation.current.kill();
      }
    };
  }, [isLoading, isDelayComplete]);

  useEffect(() => {
    gsap.from(".product-card", {
      duration: 0.5,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, [products]);

  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex text-sm items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-yellow-400" />
        ))}
        <span className="text-muted">({rating})</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {(isLoading || !isDelayComplete)
        ? Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="shimmer-container  product-card relative overflow-hidden">
              <CardContent className="p-4">
                <Skeleton className="aspect-square h-[350px] bg-gray-500 w-full rounded-lg relative z-10" />
                <Skeleton className="h-4 w-full bg-gray-500 mt-4 relative z-10" />
                <Skeleton className="h-4 w-3/4 bg-gray-500 mt-2 relative z-10" />
                <Skeleton className="h-4 w-1/2 bg-gray-500 mt-2 relative z-10" />
                <div className="shimmer bg-gray-300 absolute inset-0 -left-full w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 pointer-events-none" />
              </CardContent>
            </Card>
          ))
        : products.map((product) => {
            const isWishListed = wishListProducts.some(
              (wishlistProduct) => wishlistProduct === product._id
            );

            return (
              <Card key={product._id} className="product-card group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link
                    to={product.stock > 0 ? `/product/${product._id}` : '#'}
                    onClick={(e) => {
                      if (product.stock <= 0) e.preventDefault();
                    }}
                  >
                    <CardHeader className="relative p-2 pb-0">
                      <div className="aspect-square overflow-hidden bg-white rounded-lg">
                        <img
                          width='100%'  
                          height='100%'
                          src={
                            product.image.startsWith("http")
                              ? product.image
                              : `${import.meta.env.VITE_BASE_URL}/${product.image}`
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/fallback-image.jpg";
                          }}
                        />
                      </div>
                      {product.discountPercentage > 0 && (
                        <span className="absolute top-2 bg-amber-100 right-2 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                          {product.discountPercentage}% Off
                        </span>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 space-y-2">
                      <CardTitle className="text-mb font-semibold truncate">
                        {product.title}
                      </CardTitle>
                      <div className="flex-cols">
                        <div className="">
                          <span className="">{renderRating(product.rating)}</span>
                        </div>
                        <div className=" flex items-center gap-2">
                          <span className="text-lg font-bold text-green-400">
                            {product.price}
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {product.oldPrice}
                            </span>
                          )}
                        </div>
                        <div className=""><span className="text-xs">FREE Delivery</span>🚚 <span className="text-xs">on Orders above ₹699</span> </div>
                        
                      </div>
                    </CardContent>

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                        <span className="text-destructive-foreground/50 font-bold">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                </div>
                <CardFooter className="p-4 pt-0">
                  {product.availabilityStatus === "In Stock" && product.stock > 0 ? (
                    <div className="w-full flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1 gap-2 text-white active:bg-blue-400"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product,1,'');
                          toast.success(
                            `${product.title.split(" ").slice(0, 3).join(" ")} Added to Cart`
                          );
                        }}
                      >
                        Add to Cart
                      </Button>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product);
                        }}
                        className="p-2 border-2 border-pink-500 rounded-lg"
                      >
                        <Heart
                          size={18}
                          className={`text-pink-500 ${isWishListed ? "fill-pink-500" : "fill-transparent"} cursor-pointer transition-colors`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex gap-2">
                      <Button
                        variant="destructive"
                        className="w-full text-white active:bg-blue-400"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.error(`Oops! Out Of Stock`);
                        }}
                      >
                        Out of Stock
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
    </div>
  );
};

export default ProductsGrid;

ProductsGrid.propTypes = {
  products: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
};