import React, { useEffect, useState } from "react";
import { useShop } from "../context/ShopContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { toast } from "react-toastify";
import API from "../api/API";
import { useNavigate } from "react-router-dom";
import { createInteraction } from '../utils/interactions'

const Checkout = () => {
  const { checkout, setCheckout, indianRupeeFormatter, parsePrice, finalTotal } = useShop();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  


  const loadRazorpay = async () => {
    for (const item of checkout.items) {
      await createInteraction(item.product._id, 'checkout_start');
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
   
  };


  const validateItems = (items) => {
    return items.every(item =>
      item.product?._id &&
      typeof parsePrice(item.product.price) === 'number' &&
      item.quantity > 0
    );
  };

  const handleCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!checkout.items?.length || !validateItems(checkout.items)) {
      toast.error("Invalid cart items");
      setIsProcessing(false);
      return;
    }

    const requiredFields = ['username', 'address', 'city', 'state', 'postalCode', 'phone'];
    if (requiredFields.some(field => !checkout.userDetails[field])) {
      toast.error("Fill all shipping details");
      setIsProcessing(false);
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(checkout.userDetails.phone)) {
      toast.error("Invalid phone number");
      setIsProcessing(false);
      return;
    }

    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        toast.error("Payment gateway failed to load");
        setIsProcessing(false);
        return;
      }

      const processedItems = checkout.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size || '',
        priceAtPurchase: parsePrice(item.product.price)
      }));

      const response = await API.post("/payment/checkout", {
        amount: finalTotal,
        items: processedItems,
        userDetails: {
          ...checkout.userDetails,
          country: checkout.userDetails.country || 'India'
        }
      });

      const { order, orderId } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "My Store",
        description: "Complete your purchase",
        order_id: order.id,
        handler: async (paymentResponse) => {
          try {
            await API.post('/payment/verify', {
              paymentId: paymentResponse.razorpay_payment_id,
              orderId: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature
            });


            for (const item of checkout.items) {
              await createInteraction(item.product._id, 'checkout_complete');
              await createInteraction(item.product._id, 'order');
            }

            setCheckout({
              items: [],
              userDetails: {
                username: "",
                address: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                phone: "",
              }
            });

            toast.success("Order placed successfully!");
            navigate("/orders");
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: checkout.userDetails.username,
          contact: checkout.userDetails.phone,
          email: checkout.userDetails.email || ""
        },
        theme: { color: "#3399cc" }
      };

      new window.Razorpay(options).open();
    } catch (error) {
      console.log(error)
      for (const item of checkout.items) {
        await createInteraction(item.product._id, 'payment_failed');
      }
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 pt-0">
      <div className="flex w-full p-5 gap-5">
        <div className="w-[60%]">
          <h2 className="text-2xl mb-4 font-bold">Checkout</h2>
          {checkout.items?.map((item) => (
            <Card key={`${item.product._id}-${item.size}`} className="mb-4">
              <CardContent className="flex items-center justify-between p-4">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${item.product.image}`}
                  className="w-20 h-20 object-contain"
                  alt={item.product.title}
                />
                <div className="flex-1 ml-4">
                  <h4 className="font-semibold">{item.product.title}</h4>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      Qty: {item.quantity}
                      {item.size && ` | Size: ${item.size}`}
                    </span>
                    <span className="font-medium">
                      {indianRupeeFormatter.format(
                        parsePrice(item.product.price) * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-[30%] sticky top-32">
          <div className="ml-5">
            <h3 className="text-xl font-semibold mb-4">
              Shipping Details <span className="text-red-600">*</span>
            </h3>

            {['username', 'address', 'city', 'state', 'postalCode', 'country', 'phone'].map((field) => (
              <Input
                key={field}
                className="mb-3"
                placeholder={
                  field === 'username' ? 'Full Name' :
                    field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
                }
                value={checkout.userDetails[field] || ""}
                onChange={(e) => setCheckout(prev => ({
                  ...prev,
                  userDetails: { ...prev.userDetails, [field]: e.target.value }
                }))}
                type={field === 'phone' ? 'tel' : 'text'}
              />
            ))}

            <Separator className="my-6" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-xl font-bold">
                {indianRupeeFormatter.format(finalTotal)}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;