const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    ref: "product", 
    required: [true, "Product ID is required"],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity cannot be less than 1']
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL', ''], 
    default: '',
    required: false
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: 'Price must be a valid number'
    }
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User reference is required']
  },
  items: [orderItemSchema],
  shippingInfo: {
    username: {
      type: String,
      required: [true, 'Recipient name is required']
    },
    address: {
      type: String,
      required: [true, 'Shipping address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India'
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
      validate: {
        validator: function(v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    }
  },
  paymentInfo: {
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod'],
      required: [true, 'Payment provider is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  __v: {
    type: Number,
    select: false
  }
});


orderSchema.index({ user: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });


orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('order', orderSchema);