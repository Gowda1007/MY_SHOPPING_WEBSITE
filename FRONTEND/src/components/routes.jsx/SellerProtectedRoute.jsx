import React from 'react'
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from '../context/UserContext';

const SellerProtectedRoute = () => {
  const { user } = useUser();
  const { isAuthenticated } = useAuth();
  const location = useLocation();


  if (!isAuthenticated || user?.role !== "seller") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default SellerProtectedRoute;
