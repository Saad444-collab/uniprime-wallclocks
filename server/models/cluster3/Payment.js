const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  method: { type: String, required: true, enum: ['cod', 'card', 'upi', 'bank', 'easypaisa', 'jazzcash'] },
  accountNumber: { type: String },
  transactionId: { type: String },
  screenshotUrl: { type: String },
  screenshotPublicId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'verified', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  rejectedAt: { type: Date }
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

module.exports = getConnection('cluster3').model('Payment', paymentSchema);