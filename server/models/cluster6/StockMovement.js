const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  type: { type: String, enum: ['in', 'out', 'adjustment', 'reserved', 'returned'], required: true },
  quantity: { type: Number, required: true },
  balanceAfter: { type: Number },
  reference: { type: String },
  note: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

stockMovementSchema.index({ product: 1 });
stockMovementSchema.index({ createdAt: -1 });

module.exports = getConnection('cluster6').model('StockMovement', stockMovementSchema);