import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { useShop } from './context/ShopContext';
import { FaRegStar, FaStar } from 'react-icons/fa6';
import { FaStarHalfAlt } from 'react-icons/fa';

const ProductCard = ({product ,isWishListed}) => {
    const { addToCart, toggleWishlist, wishListProducts } = useShop();

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
    <div>
    <Card >
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
    </div>
  )
}

export default ProductCard