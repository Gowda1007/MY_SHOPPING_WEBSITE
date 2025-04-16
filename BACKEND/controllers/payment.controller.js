const Razorpay = require('razorpay');
const crypto = require('crypto');
const orderModel = require('../models/order.model');

const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports.checkout = async (req, res, next) => {
  try {
    const { amount, items, userDetails } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong..!"
      });
    }

    const orderItems = items.map(item => ({
      productId: item.productId, 
      quantity: item.quantity,
      size: item.size || '',
      priceAtPurchase: item.priceAtPurchase
    }));

    const newOrder = await orderModel.create({
      user: req.user._id,
      items: orderItems,
      shippingInfo: {
        username: userDetails.username,
        address: userDetails.address,
        city: userDetails.city,
        state: userDetails.state,
        postalCode: userDetails.postalCode,
        country: userDetails.country || 'India',
        phone: userDetails.phone
      },
      paymentInfo: {
        provider: 'razorpay',
        status: 'pending'
      },
      totalAmount: amount
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: newOrder._id.toString()
    };

    const razorpayOrder = await instance.orders.create(options);
    
    newOrder.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    res.status(200).json({ 
      order: razorpayOrder,
      orderId: newOrder._id 
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports.verify = async (req, res, next) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    const payment = await instance.payments.fetch(paymentId);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    const order = await orderModel.findOneAndUpdate(
      { 'paymentInfo.razorpayOrderId': orderId },
      {
        'paymentInfo.status': 'completed',
        'paymentInfo.razorpayPaymentId': paymentId,
        'orderStatus': 'processing',
        'paymentInfo.paidAt': new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};