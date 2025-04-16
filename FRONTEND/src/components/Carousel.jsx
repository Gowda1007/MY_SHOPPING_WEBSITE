import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

const images = ["/slider1.jpg", "/slider2.jpg", "/slider3.jpg", "/slider4.jpg"];

const CarouselComp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const timerRef = useRef(null);

  const startAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      gsap.to(carouselRef.current, {
        x: `-${currentIndex * 100}%`,
        duration: 1,
        ease: "power2.inOut",
      });
    }
    startAutoSlide();
  }, [currentIndex]);

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full overflow-hidden mt-10 ">
      <Carousel className="mx-14 relative">
        <CarouselContent ref={carouselRef} className="flex w-full ml-2">
          {images.map((src, index) => (
            <CarouselItem key={index} className="w-full flex-shrink-0 rounded-3xl">
              <img src={src} width="98%" alt={`Slide ${index + 1}`} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious 
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hover:bg-secondary hover:text-white bg-white p-2 rounded-full shadow-lg cursor-pointer"
          onClick={() => scrollToIndex((currentIndex - 1 + images.length) % images.length)}
        />
        <CarouselNext 
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hover:bg-secondary hover:text-white bg-white p-2 rounded-full shadow-lg cursor-pointer"
          onClick={() => scrollToIndex((currentIndex + 1) % images.length)}
        />
      </Carousel>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
              currentIndex === index ? "bg-blue-600 scale-125" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselComp;