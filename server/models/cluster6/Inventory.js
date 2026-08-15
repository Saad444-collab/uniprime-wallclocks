const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  sku: { type: String },
  quantity: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  available: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  lastRestockedAt: { type: Date }
}, { timestamps: true });

inventorySchema.index({ quantity: 1 });
inventorySchema.index({ lowStockThreshold: 1 });

module.exports = getConnection('cluster6').model('Inventory', inventorySchema);