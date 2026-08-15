const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const productVariantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, unique: true, required: true },
  name: { type: String, trim: true },
  attributes: { type: Map, of: String, default: {} },
  price: { type: Number, min: 0 },
  salePrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = getConnection('cluster1').model('ProductVariant', productVariantSchema);