import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

const SellerProtectedRoute = () => {
  const { user } = useContext(UserDataContext);

  return (user?.email && user?.role=="seller") ? <Outlet /> : <Navigate to="/" replace />;
};

export default SellerProtectedRoute;
