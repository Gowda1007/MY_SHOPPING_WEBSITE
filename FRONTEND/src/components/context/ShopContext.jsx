/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
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

  const [cartProducts, setCartProducts] = useState(() => {
    const savedCart = JSON.parse(localStorage.getItem("cartProducts")) || [];
    return savedCart.filter((item, index, self) =>
      self.findIndex(t =>
        t.product._id === item.product._id && t.size === item.size
      ) === index
    );
  });

  const [wishListProducts, setWishListProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
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

  useEffect(() => {
    localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
  }, [cartProducts]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishListProducts));
  }, [wishListProducts]);

  useEffect(() => {
    localStorage.setItem("checkout", JSON.stringify(checkout));
  }, [checkout]);

  const syncCartWithBackend = async (cart = []) => {
    if (!Array.isArray(cart) || user?.role !== "user") return;

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
    }
  };

  const syncWishlistWithBackend = async (mergedIds) => {
    if (user?.role !== "user") return;
    try {
      await API.post("/user/wishlist/bulk", {
        products: mergedIds.map(pid => ({ productId: pid }))
      });
    } catch (error) {
      console.error("Wishlist sync failed:", error);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (user && user.role === "user") {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            API.get("/user/cart"),
            API.get("/user/wishlist"),
          ]);

          const backendCart = cartRes.data?.cartProducts || [];
          const backendWishlist = wishlistRes.data?.wishListProducts || [];

          const mergedCart = mergeCarts(backendCart, cartProducts);
          const mergedWishlist = mergeWishlists(wishListProducts, backendWishlist);

          setCartProducts(mergedCart);
          setWishListProducts(mergedWishlist);

          if (JSON.stringify(mergedCart) !== JSON.stringify(cartProducts)) {
            await syncCartWithBackend(mergedCart);
          }
          await syncWishlistWithBackend(mergedWishlist);
        } catch (error) {
          console.error("Failed to load user data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCartProducts([]);
        setWishListProducts([]);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const addToCart = async (product, quantity = 1, size = "") => {
    if (user?.role !== "user") return;

    setCartProducts(prev => {
      const updated = [...prev];
      const index = updated.findIndex(item => item.product._id === product._id && item.size === size);

      if (index !== -1) {
        updated[index].quantity += quantity;
      } else {
        updated.push({ product, quantity, size });
      }

      syncCartWithBackend(updated);
      return updated;
    });

    await createInteraction(product._id, "cart");
  };

  const removeFromCart = async (product, size) => {
    if (user?.role !== "user") return;

    setCartProducts(prev => {
      const updated = prev
        .map(item => {
          if (item.product._id === product._id && item.size === size) {
            const newQty = item.quantity - 1;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      syncCartWithBackend(updated);
      return updated;
    });

    await createInteraction(product._id, "remove_from_cart");
  };

  const deleteFromCart = async (product, size) => {
    if (user?.role !== "user") return;

    setCartProducts(prev => {
      const updated = prev.filter(item => !(item.product._id === product._id && item.size === size));
      syncCartWithBackend(updated);
      return updated;
    });

    await createInteraction(product._id, "remove");
  };

  const toggleWishlist = async (product) => {
    if (!product?._id || user?.role !== "user") return;

    const productId = product._id;
    const isAlreadyIn = wishListProducts.includes(productId);
    const updated = isAlreadyIn
      ? wishListProducts.filter(id => id !== productId)
      : [...wishListProducts, productId];

    setWishListProducts(updated);
    await syncWishlistWithBackend(updated);
    if (!isAlreadyIn) await createInteraction(productId, "wishlist");

    toast.success(isAlreadyIn ? "Removed from wishlist" : "Added to wishlist");
  };

  const startCheckout = async (items) => {
    if (user?.role !== "user" || !items.length) return;

    try {
      await createInteraction(items[0].product._id, "checkout_start");
    } catch (error) {
      console.error("Checkout start error:", error);
    }
  };

  const completeCheckout = async (items) => {
    if (user?.role !== "user" || !items.length) return;

    try {
      await createInteraction(items[0].product._id, "checkout_complete");
    } catch (error) {
      console.error("Checkout complete error:", error);
    }
  };

  const mergeCarts = (backendCart = [], localCart = []) => {
    const cartMap = new Map();
    backendCart.forEach((item) => {
      const key = `${item.productId || item.product?._id}-${item.size || ""}`;
      if (!cartMap.has(key)) {
        cartMap.set(key, {
          product: item.product || { _id: item.productId },
          quantity: item.quantity || 1,
          size: item.size || ""
        });
      }
    });

    localCart.forEach((item) => {
      const key = `${item.product?._id}-${item.size || ""}`;
      if (!cartMap.has(key)) {
        cartMap.set(key, {
          product: item.product,
          quantity: item.quantity || 1,
          size: item.size || ""
        });
      }
    });

    return Array.from(cartMap.values());
  };

  const mergeWishlists = (local = [], backend = []) => {
    const all = [...new Set([...local, ...backend.map(item => item.productId)])];
    return all;
  };

  return (
    <ShopDataContext.Provider
      value={{
        isLoading,
        cartProducts,
        setCartProducts,
        wishListProducts,
        setWishListProducts,
        checkout,
        setCheckout,
        addToCart,
        removeFromCart,
        deleteFromCart,
        toggleWishlist,
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
