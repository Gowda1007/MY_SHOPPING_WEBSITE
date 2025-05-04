import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useUser } from "../context/UserContext.jsx";

const MainLayout = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      {" "}
      {(user?.isAuthenticated === true && (user?.role === "seller" || user?.role === "admin")) ? "" : <Navbar/> }
      <main className="flex-grow">
        {" "}
        <Outlet />{" "}
      </main>{" "}

      <Footer />{" "}
    </div>
  );
};

export default MainLayout;
