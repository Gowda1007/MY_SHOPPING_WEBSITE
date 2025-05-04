import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const AuthLayout = () => {
  const { user } = useUser();

  if (user?.isAuthenticated === true && user?.role === "user") {
    return <Navigate to="/home" replace />;
  }
  else if(user?.isAuthenticated === true && user?.role === "seller") {
    return <Navigate to="/seller-dashboard" replace />;
  }
  return (
    <div >
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
