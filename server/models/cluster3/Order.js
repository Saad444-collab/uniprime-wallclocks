const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cod', 'card', 'upi', 'bank', 'easypaisa', 'jazzcash'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'rejected'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  transactionId: { type: String },
  couponCode: { type: String },
  notes: { type: String },
  currencyCode: { type: String, default: 'PKR' },
  currencySymbol: { type: String, default: '₨' },
  countryCode: { type: String, default: null }
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `UPWC-${timestamp}${random}`;
  }
});

module.exports = getConnection('cluster3').model('Order', orderSchema);