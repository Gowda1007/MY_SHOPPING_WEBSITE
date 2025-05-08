import React from 'react'
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const UserProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  // Allow access to authenticated users
  return <Outlet />;
}
export default UserProtectedRoute;