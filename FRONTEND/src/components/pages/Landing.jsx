import React from "react";
import ShopByCategory from "../ShopByCategory";
import Carousel from "../Carousel";
import RecommendBar from "../RecommendBar";
import { useUser } from "../context/UserContext";
import CategoryBar from "../CategoryBar";
import CategoriesShopping from "../CategoriesShopping";

const Landing = () => {
  const { user } = useUser()
  return (
    <>
      {user?.role !== "seller" ? <div>
        <ShopByCategory />
        <Carousel />
      </div> : ""}
        <CategoriesShopping/>
      {user?.role === "user" ? <RecommendBar /> : ""}
       <CategoryBar category='Electronics' />
       <CategoryBar category='Fashion' />
    </>
  );
};

export default Landing;
