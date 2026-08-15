const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const stockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  quantity: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  reorderPoint: { type: Number, default: 0 }
}, { timestamps: true });

stockSchema.index({ warehouse: 1 });
stockSchema.index({ quantity: 1 });

module.exports = getConnection('cluster6').model('Stock', stockSchema);