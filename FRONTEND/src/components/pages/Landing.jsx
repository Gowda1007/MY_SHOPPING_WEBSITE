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
      <ShopByCategory />
      <Carousel />
      {user?.isAuthenticated === true ? <RecommendBar /> : ""}
    </>
  );
};

export default Landing;
