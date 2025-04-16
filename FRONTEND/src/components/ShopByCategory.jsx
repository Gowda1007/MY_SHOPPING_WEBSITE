import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  GiAmpleDress,
  GiLipstick,
  GiPearlNecklace,
  GiHealthIncrease,
  GiCampingTent,
  GiOfficeChair,
  GiTomato,
  GiFrenchFries,
  GiCycling,
  GiBedLamp,
  GiWashingMachine,
  GiSchoolBag,
  GiHighHeel,
  GiConverseShoe 
} from "react-icons/gi";
import {
  MdHome,
  MdOutlineComputer,
  MdSportsGymnastics,
  MdLightbulb,
  MdLuggage,
  MdCleaningServices 
} from "react-icons/md";
import {
  FaLaptop,
  FaCarrot,
  FaTshirt,
  FaBaby,
  FaFootballBall,
  FaPaw,
  FaRegClock,
  FaHandHoldingWater,
  FaDumbbell,
  FaUtensils,
} from "react-icons/fa";
import { BsFillHandbagFill, BsPhone, BsSmartwatch } from "react-icons/bs";
import { PiSneakerFill } from "react-icons/pi";

const categories = [
  {
    name: "Fashion",
    icon: <GiAmpleDress />,
    subcategories: [
      { name: "Men's Clothing", icon: <FaTshirt /> },
      { name: "Women's Wear", icon: <GiLipstick /> },
      { name: "Kids' Fashion", icon: <FaBaby /> },
      { name: "Jewelry", icon: <GiPearlNecklace /> },
      { name: "Watches", icon: <FaRegClock /> },
    ],
  },
  {
    name: "Electronics",
    icon: <FaLaptop />,
    subcategories: [
      { name: "Computers", icon: <MdOutlineComputer /> },
      { name: "Mobile Phones", icon: <BsPhone /> },
      { name: "Wearables", icon: <BsSmartwatch /> },
      { name: "Home Appliances", icon: <MdHome /> },
    ],
  },
  {
    name: "Home & Living",
    icon: <MdHome />,
    subcategories: [
      { name: "Furniture", icon: <GiOfficeChair /> },
      { name: "Decor", icon: <GiBedLamp /> },
      { name: "Kitchenware", icon: <FaUtensils /> },
      { name: "Lighting", icon: <MdLightbulb /> },
    ],
  },
  {
    name: "Sports & Outdoors",
    icon: <MdSportsGymnastics />,
    subcategories: [
      { name: "Fitness", icon: <FaDumbbell /> },
      { name: "Camping", icon: <GiCampingTent /> },
      { name: "Cycling", icon: <GiCycling /> },
      { name: "Team Sports", icon: <FaFootballBall /> },
    ],
  },
  {
    name: "Beauty & Care",
    icon: <GiLipstick />,
    subcategories: [
      { name: "Skincare", icon: <GiLipstick /> },
      { name: "Haircare", icon: <FaHandHoldingWater /> },
      { name: "Personal Care", icon: <GiHealthIncrease /> },
      { name: "Baby Care", icon: <FaBaby /> },
    ],
  },
  {
    name: "Groceries",
    icon: <FaCarrot />,
    subcategories: [
      { name: "Fresh Produce", icon: <FaCarrot /> },
      { name: "Pantry Staples", icon: <GiTomato /> },
      { name: "Snacks", icon: <GiFrenchFries /> },
      { name: "Pet Food", icon: <FaPaw /> },
    ],
  },
  {
    name: "Electrical Appliances",
    icon: <GiWashingMachine />,
    subcategories: [
      { name: "Kitchen Appliances", icon: <FaUtensils /> },
      { name: "Cleaning Appliances", icon: <MdCleaningServices  /> },
      { name: "Laundry Appliances", icon: <GiWashingMachine /> },
    ],
  },
  {
    name: "Bags & Luggage",
    icon: <BsFillHandbagFill />,
    subcategories: [
      { name: "Handbags", icon: <BsFillHandbagFill /> },
      { name: "Backpacks", icon: <GiSchoolBag /> },
      { name: "Travel Luggage", icon: <MdLuggage /> },
    ],
  },
  {
    name: "Footwear",
    icon: <PiSneakerFill />,
    subcategories: [
      { name: "Men's Footwear", icon: <GiConverseShoe /> },
      { name: "Women's Footwear", icon: <GiHighHeel /> },
      { name: "Kids Footwear", icon: <FaBaby /> },
    ],
  },
];

const ShopByCategory = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = (category) => {
    setActiveDropdown(category);
  };

  const handleCategoryClick = (category, subcategory = null) => {
    const queryParams = new URLSearchParams();
    queryParams.set("category", category);
    if (subcategory) {
      queryParams.set("subcategory", subcategory);
    }
    navigate(`/products?${queryParams.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-secondary   text-white shadow-md">
      <div className="-ml-8">
        <ul className="flex sm:flex-none flex-wrap -ml-3 gap-1  justify-center py-2.5">
          {categories.map((category) => (
            <li
              key={category.name}
              className="relative group "
              onMouseEnter={() => handleMouseEnter(category.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className="flex text-md items-center gap-0.5 py-1.5 transistion-all border-2 border-secondary hover:bg-[#77a9ff] hover:border-[#8089ff] rounded-md px-0.5 hover:bg- hover:rounded-md transition-colors"
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.icon}
                {category.name}
              </button>

              {activeDropdown === category.name &&
                category.subcategories?.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 w-64 bg-[#26ed26] p-4 shadow-xl transition-all text-base rounded-lg z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="grid gap-1">
                      {category.subcategories.map((sub) => (
                        <div
                          key={sub.name}
                          className="flex gap-2 items-center text-white  px-2 bg-[#eacb1f] border-2  border-[#F6DC43]  hover:border-primary   hover:bg-primary transition-all  rounded-md  cursor-pointer"
                          onClick={() =>
                            handleCategoryClick(category.name, sub.name)
                          }
                        >
                          {sub.icon}
                          <span className="text-white  py-2 transition-colors  font-medium">
                            {sub.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShopByCategory;
