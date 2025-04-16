// {
//     user: req.user._id,
//     items: checkout.items.map(item => ({
//       product: item.product._id,
//       quantity: item.quantity,
//       size: item.size,
//       priceAtPurchase: item.product.price
//     })),
//     shippingInfo: checkout.userDetails,
//     paymentInfo: {
//       provider: 'razorpay',
//       status: 'completed',
//       razorpayOrderId: order.id,
//       razorpayPaymentId: payment.id,
//       razorpaySignature: signature
//     },
//     totalAmount: finalTotal
//   }