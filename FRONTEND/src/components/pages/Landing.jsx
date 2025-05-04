import React from "react";
import ShopByCategory from "../ShopByCategory";
import Carousel from "../Carousel";
import ProductsBar from "../ProductsBar";
import RecommendBar from "../RecommendBar";
import { useUser } from "../context/UserContext";

const Landing = () => {
  const { user } = useUser()
  return (
    <>
      {user?.role !== "seller" ? <div>
        <ShopByCategory />
        <Carousel />
      </div> : ""}

      {user?.role === "user" ? <RecommendBar /> : ""}
    </>
  );
};

export default Landing;
