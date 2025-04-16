/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useUser } from "./UserContext";
import API from "../api/API";

export const ShopDataContext = createContext();

export const useShop = () => {
  const context = useContext(ShopDataContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopDataContext provider");
  }
  return context;
};

const ShopContext = ({ children }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from localStorage
  const [cartProducts, setCartProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("cartProducts")) || [];
  });

  const [wishListProducts, setWishListProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("wishListProducts")) || [];
  });

  const [checkout, setCheckout] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("checkout")) || {
        items: [],
        userDetails: {
          username: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          phone: "",
        },
      }
    );
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
  }, [cartProducts]);

  useEffect(() => {
    localStorage.setItem("wishListProducts", JSON.stringify(wishListProducts));
  }, [wishListProducts]);

  useEffect(() => {
    localStorage.setItem("checkout", JSON.stringify(checkout));
  }, [checkout]);

  // Backend sync functions
  const syncCartWithBackend = async (productId, quantity, size) => {
    try {
      await API.post("/user/cart", { productId, quantity, size });
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
  };

  const syncWishlistWithBackend = async (productId) => {
    try {
      await API.post('/user/wishlist', { productId }); // Keep this endpoint
    } catch (error) {
      console.error('Wishlist sync failed:', error);
    }
  };

  // Cart operations
  const addToCart = (productToAdd, productQuantity, productSize) => {
    const quantity = parseInt(productQuantity, 10) || 1;
    setCartProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product._id === productToAdd._id && item.size === productSize
      );

      const newCart = [...prev];
      if (existingIndex !== -1) {
        newCart[existingIndex].quantity += quantity;
      } else {
        newCart.push({
          product: productToAdd,
          quantity,
          size: productSize,
        });
      }

      if (user) {
        const newQuantity = existingIndex !== -1 
          ? newCart[existingIndex].quantity 
          : quantity;
        syncCartWithBackend(productToAdd._id, newQuantity, productSize);
      }

      return newCart;
    });
  };

  const removeFromCart = (productToRemove, productSize) => {
    setCartProducts((prev) => {
      const newCart = prev
        .map((item) => {
          if (
            item.product._id === productToRemove._id &&
            item.size === productSize
          ) {
            const newQuantity = item.quantity - 1;
            
            if (user) {
              if (newQuantity > 0) {
                syncCartWithBackend(productToRemove._id, newQuantity, productSize);
              } else {
                syncCartWithBackend(productToRemove._id, 0, productSize);
              }
            }

            return newQuantity > 0 
              ? { ...item, quantity: newQuantity } 
              : null;
          }
          return item;
        })
        .filter(Boolean);

      return newCart;
    });
  };

  const deleteFromCart = (productToRemove, productSize) => {
    setCartProducts((prev) => {
      const newCart = prev.filter(
        (item) =>
          !(
            item.product._id === productToRemove._id &&
            item.size === productSize
          )
      );

      if (user) {
        syncCartWithBackend(productToRemove._id, 0, productSize);
      }

      return newCart;
    });
  };

  // Wishlist operations
  const toggleWishlist = (productToAdd) => {
    setWishListProducts((prev) => {
      const exists = prev.some((product) => product._id === productToAdd._id);
      const newWishlist = exists
        ? prev.filter((product) => product._id !== productToAdd._id)
        : [...prev, productToAdd];

      if (user) {
        syncWishlistWithBackend(productToAdd._id);
      }

      return newWishlist;
    });
  };

  // Data merging and synchronization
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            API.get("/user/cart"),
            API.get("/user/wishlist"),
          ]);
  
          const backendCart = cartRes.data.cartProducts || [];
          const backendWishlist = wishlistRes.data.wishListProducts || [];
  
          // Merge data
          const mergedCart = mergeCarts(cartProducts, backendCart);
          const mergedWishlist = mergeWishlists(wishListProducts, backendWishlist);
  
          // Update state
          setCartProducts(mergedCart);
          setWishListProducts(mergedWishlist);
  
          // Sync merged data to backend
          try {
            await Promise.all([
              API.post("/user/cart/bulk", {
                products: mergedCart.map(item => ({
                  product: item.product._id,
                  quantity: item.quantity,
                  size: item.size
                }))
              }),
              API.post("/user/wishlist/bulk", {
                products: mergedWishlist.map(item => item._id)
              })
            ]);
          } catch (syncError) {
            console.error("Sync error:", syncError);
          }
  
        } catch (error) {
          console.error("Failed to load user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
  
    loadUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const mergeCarts = (localCart, backendCart) => {
    const cartMap = new Map();
  
    // Step 1: Add backendCart items to the map
    backendCart.forEach((backendItem) => {
      console.log(backendItem, "backend");
      const productId = backendItem.productId._id;
      const size = backendItem.size || '';
      const key = `${productId}-${size}`;
  
      cartMap.set(key, {
        product: backendItem.productId,
        quantity: backendItem.quantity,
        size: size
      });
    });
  
    // Step 2: Go through localCart and decide to merge or skip
    localCart.forEach((localItem) => {
      const productId = localItem.product._id;
      const size = localItem.size || '';
      const key = `${productId}-${size}`;
  
      if (cartMap.has(key)) {
        const existingItem = cartMap.get(key);
  
        // ✅ If quantity differs, add it
        if (existingItem.quantity !== localItem.quantity) {
          existingItem.quantity += localItem.quantity;
          cartMap.set(key, existingItem);
        }
        // ✅ If quantity is same, do nothing (item already exists)
      } else {
        // ✅ New unique item from localCart, add it
        cartMap.set(key, { ...localItem });
      }
    });
  
    // Return final merged cart
    return Array.from(cartMap.values());
  };
  
  
  
  const mergeWishlists = (localWishlist, backendWishlist) => {
    const wishlistMap = new Map();
  
    // Add all backend wishlist items
    backendWishlist.forEach(item => {
      wishlistMap.set(item._id, item); // Full product object (populated or plain)
    });
  
    // Add local wishlist items only if not already present
    localWishlist.forEach(item => {
      if (!wishlistMap.has(item._id)) {
        wishlistMap.set(item._id, item);
      }
    });
  
    // Return merged unique wishlist
    return Array.from(wishlistMap.values());
  };
  

  // Calculation functions
  const cartItems = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.quantity, 0),
    [cartProducts]
  );

  const indianRupeeFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const parsePrice = (price) => {
    const numericString = String(price)
      .replace(/[^0-9.]/g, "")
      .replace(/,/g, "");
    return parseFloat(numericString) || 0;
  };

  const calculateTotalSavings = () => {
    return cartProducts.reduce((acc, item) => {
      const oldPrice = parsePrice(item.product.oldPrice);
      const price = parsePrice(item.product.price);
      return acc + (oldPrice - price) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return cartProducts.reduce((total, item) => {
      return total + parsePrice(item.product.price) * item.quantity;
    }, 0);
  };

  const calculateDeliveryCharges = (totalAmount) => {
    const freeDeliveryThreshold = 699.0;
    const deliveryCharge = 70.0;
    return totalAmount >= freeDeliveryThreshold ? 0 : deliveryCharge;
  };

  const platFormFee = 20.0;
  const totalAmount = calculateTotal();
  const deliveryCharges = calculateDeliveryCharges(totalAmount);
  const finalTotal = totalAmount + deliveryCharges + platFormFee;

  return (
    <ShopDataContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        wishListProducts,
        setWishListProducts,
        toggleWishlist,
        wishListItems: wishListProducts.length,
        checkout,
        setCheckout,
        indianRupeeFormatter,
        parsePrice,
        calculateTotalSavings,
        calculateTotal,
        calculateDeliveryCharges,
        totalAmount,
        deliveryCharges,
        finalTotal,
        platFormFee,
        isLoading,
      }}
    >
      {children}
    </ShopDataContext.Provider>
  );
};

ShopContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ShopContext;