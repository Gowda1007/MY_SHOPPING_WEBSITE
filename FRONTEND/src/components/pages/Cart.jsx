import React, { useRef, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { RiDeleteBin6Fill } from "react-icons/ri";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';

const Cart = () => {
  const {
    addToCart,
    cartProducts,
    setCartProducts,
    removeFromCart,
    deleteFromCart,
    setCheckout,
    indianRupeeFormatter,
    parsePrice,
    calculateTotalSavings,
    totalAmount,
    deliveryCharges,
    finalTotal,
    platFormFee,
  } = useShop();

  const { user } = useUser();
  const navigate = useNavigate();
  const productRef = useRef(null);

  useEffect(() => {
    gsap.set(".delete-button", { width: 0 });
    return () => {
      gsap.killTweensOf(".delete-button");
    };
  }, []);

  const handleMouseEnter = (e) => {
    const deleteButton = e.currentTarget.querySelector(".delete-button");
    gsap.to(deleteButton, {
      width: 60,
      duration: 0.3,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const handleMouseLeave = (e) => {
    const deleteButton = e.currentTarget.querySelector(".delete-button");
    gsap.to(deleteButton, {
      width: 0,
      duration: 0.3,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const handleQuantityChange = (product, size, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    setCartProducts(prev => 
      prev.map(item => 
        item.product._id === product._id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handelCheckout = (e) => {
    if (cartProducts.length === 0) {
      e.preventDefault();
      return;
    }
    setCheckout({
      items: cartProducts,
      total: finalTotal,
      userDetails: {
        username: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || ""
      }
    });
    navigate("/checkout");
  };

  return (
    <div>
      <div className="p-5 min-h-96 flex">
        <div className="p-5 w-[75%] gap-2 flex flex-col">
          {cartProducts.length > 0 && (
            <h1 className="text-xl font-bold mb-5">Cart items:</h1>
          )}
          {cartProducts.map((item) => (
            <div
              key={`${item.product._id}-${item.size}`}
              ref={productRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="flex relative product-div h-40 z-10 overflow-hidden border bg-primary-foreground/30 rounded-xl"
            >
              <Link
                to={`/product/${item.product._id}`}
                className="bg-gray-50 relative border-r"
              >
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${item.product.image}`}
                  className="w-40 p-3 h-40"
                  alt={item.product.title}
                />
                {item.product.discountPercentage > 0 && (
                  <span className="absolute top-1 bg-amber-100 left-1 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.product.discountPercentage}% Off
                  </span>
                )}
              </Link>
              <div className="h-full pl-5 w-full bg-secondary/15 flex flex-col justify-evenly">
                <h4 className="font-semibold">{item.product.title}</h4>
                <div className="flex justify-between pr-36 place-items-start w-full">
                  <div className="flex gap-5 justify-between items-center">
                    <h2 className="font-semibold flex items-center gap-1">
                      <span>
                        {indianRupeeFormatter.format(
                          parsePrice(item.product.price)
                        )}
                      </span>
                      <span className="text-[10px] line-through text-gray-500">
                        {indianRupeeFormatter.format(
                          parsePrice(item.product.oldPrice)
                        )}
                      </span>
                    </h2>
                    {item.size && (
                      <span className="text-sm px-2 py-1 bg-slate-700 rounded font-semibold text-white">
                        {item.size}
                      </span>
                    )}
                    <div className="flex gap-3">
                      <button
                        className="h-8 w-8 text-center rounded font-bold shadow-md text-primary border-primary border-2 flex items-center justify-center active:scale-105"
                        onClick={() => removeFromCart(item.product, item.size)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.product,
                            item.size,
                            e.target.value
                          )
                        }
                        className="w-8 h-8 text-center rounded border-2 border-primary appearance-none"
                      />
                      <button
                        className="h-8 w-8 text-center rounded font-bold shadow-md text-primary border-primary border-2 flex items-center justify-center active:scale-105"
                        onClick={() => addToCart(item.product, 1, item.size)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-1 justify-center">
                      <span className="font-base">Subtotal:</span>
                      <span className="text-green-500 ">
                        {indianRupeeFormatter.format(
                          parsePrice(item.product.price) * item.quantity
                        )}
                      </span>
                      <span className="text-gray-500 font-base text-xs line-through">
                        {indianRupeeFormatter.format(
                          parsePrice(item.product.oldPrice) * item.quantity
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  const productDiv = e.currentTarget.closest(".product-div");
                  gsap.to(productDiv, {
                    x: "-100%",
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out",
                    onComplete: () => {
                      deleteFromCart(item.product, item.size);
                    },
                  });
                }}
                className="delete-button absolute -right-1 h-full top-0 z-10 ml-7 rounded font-bold shadow-md bg-primary text-white border-primary border-2 flex items-center justify-center overflow-hidden"
              >
                <RiDeleteBin6Fill className="min-w-max" />
              </button>
            </div>
          ))}
          {cartProducts.length === 0 && (
            <div className="w-screen -ml-10 mt-20">
              <h2 className="text-center w-full flex justify-center items-center text-xl font-semibold">
                Oops! no products in your cart
              </h2>
              <div className="text-center w-full text-lg mt-10">
                Continue Shopping 👉{" "}
                <Link
                  className="text-secondary px-3 py-2 border-2 rounded-lg border-secondary"
                  to="/"
                >
                  Home
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="w-[25%] fixed right-3 top-22">
          {cartProducts.length > 0 && (
            <>
              <div className="w-full rounded-2xl h-fit p-5 border border-gray-400 ">
                <h2 className="text-xl font-bold mb-4">Price Details</h2>
                <div className="grid grid-cols-2 gap-y-3">
                  <span>Price ({cartProducts.length} items)</span>
                  <span className="text-end">
                    {indianRupeeFormatter.format(totalAmount)}
                  </span>
                  <span>Discount</span>
                  <span className="text-end text-green-500">
                    -{indianRupeeFormatter.format(calculateTotalSavings())}
                  </span>
                  <span>Delivery Charges</span>
                  <span className="text-end">
                    {indianRupeeFormatter.format(deliveryCharges)}
                  </span>
                  <span>PlatForm Fee</span>
                  <span className="text-end">₹{platFormFee}</span>
                  <hr className="col-span-2 my-2" />
                  <span className="font-bold">Total Amount</span>
                  <span className="text-end text-xl font-bold text-green-500">
                    {indianRupeeFormatter.format(finalTotal)}
                  </span>
                </div>
                <button
                  className="w-full ease-in rounded-xl transition-all text-white mt-5 h-10 bg-primary active:bg-rose-400"
                  onClick={handelCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
              <div className="flex w-full relative mt-10 place-content-end p-10 ">
                <div className="inline border border-primary pl-5 pt-5 rounded-2xl text-gray-700">
                  Apply Coupon Code:
                  <form>
                    <input
                      type="text"
                      placeholder="Eg:M3XTOP30"
                      className="w-42 m-3 ml-0 px-2 py-1 bg-primary-foreground border rounded-2xl"
                    />
                    <input
                      type="submit"
                      defaultValue="Apply"
                      className="mr-3 active:border-black border rounded-2xl p-1 border-gray-400 text-primary"
                    />
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;