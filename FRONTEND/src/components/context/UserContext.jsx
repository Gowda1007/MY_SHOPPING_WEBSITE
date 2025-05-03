/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import API from "../api/API";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export const UserDataContext = createContext();

export const useUser = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContext");
  }
  return context;
};

const UserContext = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const userLogin = useCallback(async (userData) => {
    try {
      const userWithAuth = { ...userData, isAuthenticated: true };
      setUser(userWithAuth);
      localStorage.setItem("user", JSON.stringify(userWithAuth));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  const userLogout = useCallback(async () => {
    try {
      await API.get("/user/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      googleLogout();
      const cart = localStorage.getItem("cartProducts");
      const wishlist = localStorage.getItem("wishlist");
      localStorage.clear();
      if (cart) localStorage.setItem("cartProducts", cart);
   if (wishlist) localStorage.setItem("wishlist", wishlist);
      setUser (null);
      navigate("/");
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const { data } = await API.get("/user/isvaliduser");
        if (data?.valid === false || !data) {
          userLogout();
        }
      } catch {
        console.log("Token validation failed");
      }
    };

    const interval = setInterval(validateToken, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userLogout]);

  return (
    <UserDataContext.Provider value={{ user, userLogin, userLogout }}>
      {children}
    </UserDataContext.Provider>
  );
};

UserContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContext;
