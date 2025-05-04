import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import API from './api/API';
import ProductCard from './ProductCard';
import gsap from 'gsap';
import { useShop } from './context/ShopContext';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

const ProductsBar = ({ product }) => {
    const [relatedProducts, setRelatedProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const { wishListProducts } = useShop();
    const [isDelayComplete, setIsDelayComplete] = useState(false);
    const shimmerAnimation = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDelayComplete(true);
            setIsLoading(false);
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
    }, [relatedProducts]);



    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const response = await API.post("/recommendations/content/", {
                    productId: product._id
                });
                setRelatedProducts(response.data.products);
                setIsLoading(false);
            } catch (error) {
                console.error("Related Recommendations failed:", error);
            }
        };

        fetchRelated();
    }, []);
    const handleScroll = (scrollOffset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: scrollOffset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative m-7">
            <h1 className="text-xl font-bold mb-4 mt-5">Recommended for you</h1>
            <div
                ref={scrollRef}
                className="flex overflow-x-auto flex-nowrap gap-4 pb-4 scrollbar-hide"
            >
                {(isLoading || !isDelayComplete)
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i} className="shimmer-container product-card flex-shrink-0 w-64 relative overflow-hidden">
                            <CardContent className="p-4">
                                <Skeleton className="aspect-square h-[350px] bg-gray-500 w-full rounded-lg relative z-10" />
                                <Skeleton className="h-4 w-full bg-gray-500 mt-4 relative z-10" />
                                <Skeleton className="h-4 w-3/4 bg-gray-500 mt-2 relative z-10" />
                                <Skeleton className="h-4 w-1/2 bg-gray-500 mt-2 relative z-10" />
                                <div className="shimmer bg-gray-300 absolute inset-0 -left-full w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 pointer-events-none" />
                            </CardContent>
                        </Card>
                    ))
                    : relatedProducts.length > 0 ? relatedProducts.map((product) => {
                        const isWishListed = wishListProducts.some(
                            (wishlistProduct) => wishlistProduct === product._id
                        );

                        return (
                            <div key={product._id} className="product-card group hover:shadow-lg transition-shadow flex-shrink-0 w-64">
                                <ProductCard product={product} isWishListed={isWishListed} />
                            </div>
                        );
                    }) : (
                        <div className="flex-shrink-0 w-64">
                            <p className="text-gray-500">No products found.</p>
                        </div>
                    )}
            </div>

            {!isLoading && isDelayComplete && (
                <>
                    <button
                        onClick={() => handleScroll(-200)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleScroll(200)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    )
}

export default ProductsBar;