const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  interactionDate: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'user'
  },
  productId: {
    type: String,
    required: true,
    ref: 'product' 
  },
  type: {
    type: String,
    enum: [
      'order', 'cart', 'wishlist', 'view',
      'search', 'click', 'remove_from_cart',
      'checkout_start', 'checkout_complete', 'payment_failed','notify_me'
    ],
    required: true
  }
});

module.exports = mongoose.model('interactions', interactionSchema);
