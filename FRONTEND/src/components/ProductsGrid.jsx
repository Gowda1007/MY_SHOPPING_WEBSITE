import { useEffect, useState, useRef, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { Card, CardContent,} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useShop } from "./context/ShopContext";
import ProductCard from "./ProductCard";

const ProductsGrid = ({ products, isLoading }) => {
  const { wishListProducts } = useShop();
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
              <div key={product._id} className="product-card group hover:shadow-lg transition-shadow">
                <ProductCard product={product} isWishListed={isWishListed}/>
              </div>
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