const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const paymentSettingsSchema = new mongoose.Schema({
  method: { type: String, unique: true, required: true },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  instructions: { type: String, default: '' },
  qrCode: { type: String },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = getConnection('cluster3').model('PaymentSettings', paymentSettingsSchema);