import MainLayout from "./components/layout/MainLayout";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/pages/Landing";
import Products from "./components/pages/Products";
import Product from "./components/pages/ProductPage";
import AuthLayout from "./components/layout/AuthLayout";
import SignIn from "./components/pages/SignIn";
import SignUp from "./components/pages/SignUp";
import UserProtectedRoute from "./components/routes.jsx/UserProtectedRoute";
import Cart from "./components/pages/Cart";
import Profile from "./components/pages/Profile";
import Orders from "./components/pages/Orders";
import SellerProtectedRoute from "./components/routes.jsx/SellerProtectedRoute";
import SellerHome from "./components/pages/SellerHome";
import WishList from "./components/pages/WishList";
import ScrollToTop from "./hooks/ScrollToTop";
import Checkout from "./components/pages/Checkout";
import Payment from "./components/pages/Payment";
import SellerRegister from "./components/pages/SellerRegister";
import Analytics from "./components/pages/Analytics";
const App = () => {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/register-as-seller" element={<SellerRegister />} />
        <Route path="*" element={<Landing />} />
      </Route>

      {/* Auth Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Route>

      {/* Protected Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route element={<UserProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Route>

      {/* Seller Routes */}
      <Route element={<MainLayout />}>
        <Route element={<SellerProtectedRoute />}>
          <Route path="/seller-dashboard" element={<SellerHome />} />
          <Route path="/anlytics" element={<Analytics />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
