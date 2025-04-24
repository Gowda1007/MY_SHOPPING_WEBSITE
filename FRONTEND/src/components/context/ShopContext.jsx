/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useUser } from "./UserContext";
import API from "../api/API";
import { createInteraction } from "../utils/interactions";
import { toast } from "react-toastify";

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
    return JSON.parse(localStorage.getItem('wishlist')) || [];
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
    localStorage.setItem("wishlist", JSON.stringify(wishListProducts));
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

  const syncWishlistWithBackend = async (mergedIds) => {
    try {
      // Convert to backend-compatible format
      const backendFormat = mergedIds.map(pid => ({ productId: pid }));

      await API.post('/user/wishlist/bulk', {
        products: backendFormat
      });
    } catch (error) {
      console.error('Bulk wishlist sync failed:', error);
    }
  };

  // Cart operations
  const addToCart = async (productToAdd, productQuantity, productSize) => {
    const quantity = parseInt(productQuantity, 10) || 1;

    // Calculate the new cart state
    const newCart = [...cartProducts];
    const existingIndex = newCart.findIndex(
      (item) => item.product._id === productToAdd._id && item.size === productSize
    );

    if (existingIndex !== -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        product: productToAdd,
        quantity,
        size: productSize,
      });
    }

    // Update the state with the new cart array
    setCartProducts(newCart);

    if (user) {
      const newQuantity = existingIndex !== -1
        ? newCart[existingIndex].quantity
        : quantity;

      // Perform async operations after state update
      await syncCartWithBackend(productToAdd._id, newQuantity, productSize);
      await createInteraction(productToAdd._id, 'cart');
    }
  };

  const removeFromCart = async (productToRemove, productSize) => {
    // Calculate the new cart state
    const newCart = cartProducts
      .map((item) => {
        if (
          item.product._id === productToRemove._id &&
          item.size === productSize
        ) {
          const newQuantity = item.quantity - 1;
          return newQuantity > 0
            ? { ...item, quantity: newQuantity }
            : null;
        }
        return item;
      })
      .filter(Boolean);

    // Update the state with the new cart array
    setCartProducts(newCart);

    if (user) {
      const updatedQuantity = cartProducts.find(
        (item) =>
          item.product._id === productToRemove._id && item.size === productSize
      )?.quantity - 1 || 0;

      if (updatedQuantity > 0) {
        await syncCartWithBackend(productToRemove._id, updatedQuantity, productSize);
      } else {
        await syncCartWithBackend(productToRemove._id, 0, productSize);
      }
      await createInteraction(productToRemove._id, 'remove_from_cart');
    }
  };

  const deleteFromCart = async (productToRemove, productSize) => {
    try {
      const newCart = cartProducts.filter(
        (item) =>
          !(
            item.product._id === productToRemove._id &&
            item.size === productSize
          )
      );

      setCartProducts(newCart);

      if (user) {
        await syncCartWithBackend(productToRemove._id, 0, productSize);
        await createInteraction(productToRemove._id, "remove_from_cart");
      }

    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error("Failed to remove from cart");
    }
  };

  const startCheckout = async (items) => {
    try {
      if (user && items.length > 0) {
        await createInteraction(items[0].product._id, "checkout_start");
      }
      // ... rest of checkout logic
    } catch (error) {
      console.error('Error starting checkout:', error);
    }
  };

  const completeCheckout = async (items) => {
    try {
      if (user && items.length > 0) {
        await createInteraction(items[0].product._id, "checkout_complete");
      }
      // ... rest of checkout completion logic
    } catch (error) {
      console.error('Error completing checkout:', error);
    }
  };

  // Wishlist operations
  const toggleWishlist = async (productToAdd) => {
    if (!productToAdd?._id) {
      toast.error("Invalid product");
      return;
    }

    const prevWishlist = [...wishListProducts];
    const productId = productToAdd._id;

    try {
      const isAlreadyInWishlist = wishListProducts.includes(productId);
      const newWishlist = isAlreadyInWishlist
        ? wishListProducts.filter(id => id !== productId)
        : [...wishListProducts, productId];

      setWishListProducts(newWishlist);

      if (user?.isAuthenticated) {
        // Send array of strings to sync function
        await syncWishlistWithBackend(newWishlist);
        if (!isAlreadyInWishlist) {
          await createInteraction(productId, 'wishlist');
        }
      }

      toast.success(isAlreadyInWishlist ?
        "Removed from wishlist" :
        "Added to wishlist");
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setWishListProducts(prevWishlist);
      toast.error("Failed to update wishlist");
    }
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

          // Ensure backendWishlist is an array
          if (!Array.isArray(backendWishlist)) {
            backendWishlist = [];
          }

          // Merge data
          const mergedCart = mergeCarts(cartProducts, backendCart);
          const mergedWishlist = mergeWishlists(wishListProducts, backendWishlist);

          // Update state
          setCartProducts(mergedCart);
          setWishListProducts(mergedWishlist);

          localStorage.setItem("wishListProducts", JSON.stringify(mergedWishlist));
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
                products: mergedWishlist.map(pid => ({ productId: pid }))
              })
            ]);
          } catch (syncError) {
            console.error("Sync error:", syncError);
          }

        } catch (error) {
          console.error("Failed to load user data:", error);
          throw error;
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

  const mergeWishlists = (localWishlist = [], backendWishlist = []) => {
    const seen = new Set();
    const merged = [];
  
    // Process backend wishlist (array of objects)
    backendWishlist.forEach(item => {
      const pid = item.productId?._id || item.productId;
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        merged.push(pid); // Store as string
      }
    });
  
    // Process local wishlist (array of mixed types)
    localWishlist.forEach(item => {
      const pid = typeof item === 'object' ? item.productId : item;
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        merged.push(pid);
      }
    });
  
    return merged; // Returns ["uuid1", "uuid2", ...]
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
        startCheckout,
        completeCheckout,
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