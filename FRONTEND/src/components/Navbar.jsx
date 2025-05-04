import { FaHeart } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Command, CommandInput } from "./ui/command.jsx";
import { FaLocationDot } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useShop } from "./context/ShopContext";
import { useUser } from "./context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [postalCode, setPostalCode] = useState("");
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const { cartItems, wishListItems } = useShop();
  const { user, userLogout } = useUser();
  useEffect(() => {}, [cartItems, user]);

  const fetchLocationData = async () => {
    if (!postalCode.trim()) {
      setError("Postal code cannot be empty.");
      return;
    }

    setError("");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ZIP_CODE_URL}/search`,
        {
          params: {
            apikey: import.meta.env.VITE_ZIP_CODE_API_KEY,
            codes: postalCode,
          },
        }
      );

      if (response.data.results?.[postalCode]) {
        const locationsList = response.data.results[postalCode].map(
          (location) => ({
            city: location.city_en || location.city,
            country: location.country_name || "Unknown country",
            state: location.state_en || location.state,
          })
        );

        setLocations(locationsList);
        if (locationsList.length === 0) setError("No locations found.");
      } else {
        setLocations([]);
        setError("Invalid postal code.");
      }
    } catch (err) {
      setError("Could not fetch location. Try again later.");
      console.error("Error:", err);
    }
  };
  const handleInputChange = (e) => {
    setPostalCode(e.target.value);
  };
  const toggleDropdown = (dropdown) => {
    setDropdownOpen((prev) => (prev === dropdown ? null : dropdown));
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="w-full sticky top-0 z-100 bg-white">
      {" "}
      <div className="flex justify-between to-background gap-1 sm:ml-0 max-h-20 px-7 pr-3 p-2 shadow-md items-center">
        {" "}
        <Link to="/" className="flex items-center">
          <img src="logo.png" alt="Logo" className="w-8 h-8 sm:w-12 sm:h-12" />
          <h1 className="mx-2 text-nowrap text-2xl flex-nowrap  font-bold  ">
            ShopEase
          </h1>
        </Link>
        <Command className="flex mx-10">
          <CommandInput
            type="text"
            className="h-14 text-mb"
            placeholder="Search for products..."
          />
        </Command>
        <div
          className="relative hidden md:inline max-w-2/3 z-40"
          ref={dropdownRef}
        >
          {userLocation && (
            <span className="absolute top-0 left-8 whitespace-nowrap text-xs text-gray-500">
              Deliver to{" "}
            </span>
          )}
          <button
            onClick={() => toggleDropdown("location")}
            aria-expanded={dropdownOpen === "location"}
            className="inline-flex mt-1 gap-1 items-center text-nowrap  px-4 py-2 bg-background rounded-md shadow-sm"
          >
            <FaLocationDot className="text-lg" />
            <p>{userLocation || "Enter Pincode"}</p>
            <svg
              className="ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {dropdownOpen === "location" && (
            <div className="border border-red-70 whitespace-nowrap absolute left-0 overflow-y-auto h-30 max-h-80 top-8 mt-2 w-64 bg-background shadow-md rounded-md p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postalCode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                  placeholder="Enter Zip Code"
                />
                <button
                  onClick={fetchLocationData}
                  className="text-black hover:text-primary hover:border-primary border border-black px-2 py-1 rounded-md"
                >
                  Apply
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              {locations.length > 0 && (
                <ul className="mt-2">
                  {locations.map((location, index) => (
                    <li
                      key={index}
                      className="py-1 hover:bg-gray-200 cursor-pointer px-2 rounded"
                      onClick={() => {
                        setUserLocation(location.city);
                        toggleDropdown("location");
                      }}
                    >
                      {location.city}, {location.state}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 sm:gap-4">
          <Link
            to="/wishlist"
            className="flex relative items-center gap-1 p-2 hover:bg-gray-100 rounded-md"
          >
            <FaHeart className="text-lg" />
            <span className="hidden md:inline">Wishlist</span>
            <span className="bg-primary absolute top-0 right-0 px-1 text-[10px] text-white rounded-full">
              {wishListItems}
            </span>
          </Link>

          <Link
            to="/cart"
            className="flex relative items-center gap-1 p-2 hover:bg-gray-100 rounded-md"
          >
            <FaShoppingCart className="text-lg" />
            <span className="hidden md:inline">Cart</span>
            <span className="bg-primary absolute top-0 right-0 px-1 text-[10px] text-white rounded-full">
              {cartItems}
            </span>
          </Link>
        </div>
        {user?.email ? (
          <div className="flex items-center justify-center ml-2 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full bg-transparent border border-gray-300 ">
                <Avatar>
                  <AvatarImage
                    className="border border-gray-300 rounded-full w-30"
                    src={`${import.meta.env.VITE_BASE_URL}${user.image}`}
                  />
                  <AvatarFallback className="text-sm bg-primary-foreground border-2 border-black flex items-center justify-center">
                    {user?.username.split("").slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-1 border-2 bg-white z-10  text-black ">
                <Link to="/account">
                  <DropdownMenuLabel className="hover:text-white hover:bg-pink-500 rounded">
                    My Account
                  </DropdownMenuLabel>
                </Link>
                <DropdownMenuSeparator className="" />
                <Link to="/profile">
                  <DropdownMenuLabel className=" hover:text-white hover:bg-pink-500 rounded">
                    Profile
                  </DropdownMenuLabel>
                </Link>
                <Link to="/orders">
                  <DropdownMenuLabel className=" hover:text-white hover:bg-pink-500 rounded">
                    Orders
                  </DropdownMenuLabel>
                </Link>
                <Link to="/register-as-seller">
                  <DropdownMenuLabel className=" hover:text-white hover:bg-pink-500 rounded">
                    Become a Seller
                  </DropdownMenuLabel>
                </Link>
                <DropdownMenuLabel
                  className="  hover:text-white hover:bg-pink-500 rounded"
                  onClick={userLogout}
                >
                  Logout
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link to="/login">
            <Button className="sm:text-xs ml-5 bg-primary active:scale-105 font-bold">
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
