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
    const savedCart = JSON.parse(localStorage.getItem("cartProducts")) || [];
    // Ensure unique products based on product ID and size
    const uniqueCart = savedCart.filter((item, index, self) =>
      self.findIndex(t =>
        t.product._id === item.product._id &&
        t.size === item.size
      ) === index
    );
    return uniqueCart;
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
  const syncCartWithBackend = async (cart = []) => {
    if (!Array.isArray(cart)) {
      console.error('Invalid cart data:', cart);
      return;
    }

    const formattedCart = cart
      .map((item) => ({
        productId: item.product?._id,
        quantity: item.quantity,
        size: item.size || "",
      }))
      .filter((item) => item.productId);

    try {
      await API.post("/user/cart/bulk", { products: formattedCart });
    } catch (error) {
      console.error("Cart sync failed:", error);
      console.error("Failed to save cart changes. Please try again.");
    }
  };


  // Sync Wishlist with Backend
  const syncWishlistWithBackend = async (mergedIds) => {
    try {
      await API.post('/user/wishlist/bulk', {
        products: mergedIds.map(pid => ({ productId: pid }))
      });
    } catch (error) {
      console.error('Wishlist sync failed:', error);
      console.error("Failed to save wishlist changes");
    }
  };

  // Load User Data
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            API.get("/user/cart"),
            API.get("/user/wishlist"),
          ]);

          // Handle potential missing data
          const backendCart = cartRes.data?.cartProducts || [];
          const backendWishlist = wishlistRes.data?.wishListProducts || [];


          // Merge carts/wishlists
          const mergedCart = mergeCarts(backendCart, cartProducts);
          const mergedWishlist = mergeWishlists(wishListProducts, backendWishlist);


          // Update state
          setCartProducts(mergedCart);
          setWishListProducts(mergedWishlist);

          // Sync merged data to backend only if there are changes
          if (JSON.stringify(mergedCart) !== JSON.stringify(cartProducts)) {
            await syncCartWithBackend(mergedCart); // Sync only if there are changes
          }
          await syncWishlistWithBackend(mergedWishlist);
        } catch (error) {
          console.error("Data sync failed:", error);
          console.error("Failed to load user data");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear sensitive data when logged out
        setCartProducts([]);
        setWishListProducts([]);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const addToCart = async (productToAdd, productQuantity, productSize) => {
    const quantity = parseInt(productQuantity, 10) || 1;

    setCartProducts(prevCart => {
      const newCart = [...prevCart];
      const existingIndex = newCart.findIndex(
        (item) => item.product._id === productToAdd._id && item.size === productSize
      );

      if (existingIndex !== -1) {
        // If the product with the same ID and size exists, update the quantity
        newCart[existingIndex].quantity += quantity;
      } else {
        // Otherwise, add the new product to the cart
        newCart.push({
          product: productToAdd,
          quantity,
          size: productSize,
        });
      }

      // Sync with backend after updating state
      syncCartWithBackend(newCart); // Pass the new cart directly
      return newCart; // Return the new cart state
    });

    if (user) {
      await createInteraction(productToAdd._id, 'cart');
    }
  };

  const removeFromCart = async (productToRemove, productSize) => {
    setCartProducts(prevCart => {
      const newCart = prevCart
        .map((item) => {
          if (item.product._id === productToRemove._id && item.size === productSize) {
            const newQuantity = item.quantity - 1;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null; // Decrease quantity or remove
          }
          return item;
        })
        .filter(Boolean); // Remove null values

      // Sync with backend after updating state
      syncCartWithBackend(newCart); // Pass the updated cart
      return newCart; // Return the updated cart state
    });

    if (user) {
      await createInteraction(productToRemove._id, 'remove_from_cart');
    }
  };

  const deleteFromCart = async (productToDelete, productSize) => {
    setCartProducts(prevCart => {
      const newCart = prevCart.filter(item => !(item.product._id === productToDelete._id && item.size === productSize));

      // Sync with backend after deletion
      syncCartWithBackend(newCart); // Pass the updated cart
      return newCart; // Return the updated cart state
    });

    if (user) {
      await createInteraction(productToDelete._id, 'remove');
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
      console.error("Invalid product");
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
      console.error("Failed to update wishlist");
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


          const backendCart = cartRes.data?.cartProducts || [];
          const mergedCart = mergeCarts(backendCart, cartProducts);

          setCartProducts(mergedCart);

          if (JSON.stringify(mergedCart) !== JSON.stringify(cartProducts)) {
            await syncCartWithBackend(mergedCart);
          }
        } catch (error) {
          console.error("[Sync] Error:", error);
        }
      }
    };


    loadUserData();
  }, [user]);

  const mergeCarts = (backendCart = [], localCart = []) => {
    const cartMap = new Map();

    // Process backend items first
    backendCart.forEach((backendItem) => {
      const productId = backendItem.productId || backendItem.product?._id;
      const size = backendItem.size || "";
      const key = `${productId}-${size}`;

      if (!cartMap.has(key)) {
        cartMap.set(key, {
          product: backendItem.product || { _id: productId },
          quantity: backendItem.quantity || 1,
          size: size || ""
        });
      }
    });

    // Process local items
    localCart.forEach((localItem) => {
      const productId = localItem.product?._id;
      const size = localItem.size || "";
      const key = `${productId}-${size}`;

      if (!cartMap.has(key)) {
        cartMap.set(key, {
          product: localItem.product,
          quantity: localItem.quantity || 1,
          size: size || ""
        });
      }
    });

    return Array.from(cartMap.values());
  };



  const mergeWishlists = (localWishlist = [], backendWishlist = []) => {
    const seen = new Set();

    // Process backend items (array of {productId} objects)
    backendWishlist.forEach(item => {
      const pid = item.productId;
      if (pid) seen.add(pid.toString());
    });

    // Process local items (array of strings)
    localWishlist.forEach(pid => {
      if (pid) seen.add(pid.toString());
    });

    return Array.from(seen);
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
      if (!item.product || !item.product.price) return total;
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