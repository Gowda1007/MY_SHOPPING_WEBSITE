import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryCard from './CategoryCard'

const categories = [
  {
    name: 'Fashion',
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/baccb95a-cc5e-4acb-9554-a0005c1d8e1f.webp`,
  },
  {
    name: 'Electronics',
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/9dada592-c1cb-4f2d-9558-6ff9571ab6dd.webp`,
  },
  {
    name: 'Home & Living',
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/6027cf28-18f8-4398-9100-4710cd2265a7.webp`,
  },
  {
    name: 'Sports & Outdoors',
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/6544b285-7196-41a0-b8cc-6fec6e896cdf.webp`,
  },
  {
    name: 'Beauty & Care',
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/607166a7-ac45-45f7-a01a-a700796d11a7.webp`,
  },
  {
    name: 'Groceries',
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/fd60e043-0072-4a2e-b67b-9b5ddd2c16e6.webp`,
  },
  {
    name: "Electrical Appliances",
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/bb35f853-4862-4d68-b3a6-11cf31b70a06.webp`,
  },
  {
    name: "Bags & Luggage",
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/3d5e78ed-36c4-40eb-962e-da03d12d33bf.webp`,
  }, {
    name: "Footwear",
    imagePath: `${import.meta.env.VITE_BASE_URL}/images/31c28f79-25f6-48ce-a921-55306a91cc94.webp`,
  }
]

const CategoriesShopping = () => {
  const scrollRef = React.useRef(null);

  const handleScroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative m-5">
      <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
          />
        ))}
      </div>

      {/* Optional: Add scroll buttons */}
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
    </div>
  )
}

export default CategoriesShopping;