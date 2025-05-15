import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { useShop } from "./context/ShopContext";
import { useUser } from "./context/UserContext";
import { IoLocation } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
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
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { cartItems, wishListItems } = useShop();
  const { user, setUser, userLogout } = useUser();

  const fetchLocationData = async () => {
    if (!postalCode.trim()) {
      setError("Postal code cannot be empty.");
      return;
    }

    setError("");
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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

  const handleWordSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fires when a word is completed (on space or Enter)
  const handleKeyDown = async (e) => {
    if (e.key === " " || e.key === "Enter") {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        await handleWordSearch(trimmedQuery);
      }
    }
  };

  return (
    <div className="w-full sticky top-0 z-[100] bg-white">
      <div className="flex justify-between items-center gap-1 max-h-20 px-7 pr-3 py-2 shadow-md">
        <Link to="/" className="flex items-center">
          <h1 className="mx-2 text-2xl font-bold whitespace-nowrap">
            ShopEase
          </h1>
        </Link>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 text-base px-4 w-full outline-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search for products..."
          required
        />

        <div className="relative hidden md:inline z-50" ref={dropdownRef}>
          {userLocation && (
            <span className="absolute top-0 left-8 text-xs text-gray-500">
              Deliver to
            </span>
          )}
          <button
            onClick={() => toggleDropdown("location")}
            className="inline-flex mt-1 gap-1 items-center px-4 py-2 bg-background rounded-md shadow-sm"
          >
            <IoLocation className="text-lg" />
            <p className="whitespace-nowrap">
              {userLocation || "Enter Pincode"}
            </p>
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
            <div className="absolute left-0 top-8 mt-2 w-64 bg-white border rounded-md shadow-md p-4 max-h-80 overflow-y-auto z-50">
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
                  {isLoading ? "..." : "Apply"}
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
                      className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setUserLocation(location.city);
                        toggleDropdown("location");
                        setUser((prev) => ({
                          ...prev,
                          location: postalCode,
                          city: location.city,
                        }));
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

        <div className="hidden sm:flex items-center gap-4">
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
          <div className="flex items-center justify-center ml-2 mr-2 z-[9999]">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full bg-transparent border border-gray-300">
                <Avatar>
                  <AvatarImage
                    className="rounded-full w-8 h-8"
                    src={`${import.meta.env.VITE_BASE_URL}${user.image}`}
                  />
                  <AvatarFallback className="text-sm bg-primary-foreground border-2 border-black flex items-center justify-center">
                    {user?.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-2 bg-white z-[9999] text-black mt-2">
                <Link to="/account">
                  <DropdownMenuLabel className="hover:text-white hover:bg-pink-500 rounded">
                    My Account
                  </DropdownMenuLabel>
                </Link>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuLabel className="hover:text-white hover:bg-pink-500 rounded">
                    Profile
                  </DropdownMenuLabel>
                </Link>
                <Link to="/orders">
                  <DropdownMenuLabel className="hover:text-white hover:bg-pink-500 rounded">
                    Orders
                  </DropdownMenuLabel>
                </Link>
                <Link to="/register-as-seller">
                  <DropdownMenuLabel className="hover:text-white hover:bg-pink-500 rounded">
                    Become a Seller
                  </DropdownMenuLabel>
                </Link>
                <DropdownMenuItem
                  onClick={userLogout}
                  className="hover:text-white hover:bg-pink-500 rounded"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link to="/login">
            <Button className="ml-5 bg-primary font-bold active:scale-105">
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
