import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const AuthLayout = () => {
  const { user } = useUser();

  if (user?.isAuthenticated === true) {
    return <Navigate to="/home" replace />;
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
