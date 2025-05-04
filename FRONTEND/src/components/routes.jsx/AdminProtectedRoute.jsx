import React from 'react'
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from '../context/UserContext';

const AdminProtectedRoute = () => {
  const { user } = useUser();
  const { isAuthenticated } = useAuth();
  const location = useLocation();


  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default AdminProtectedRoute;
