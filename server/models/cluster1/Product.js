const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: 200 },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  salePrice: { type: Number, min: 0 },
  multiCurrencyPrices: { type: Map, of: Number, default: {} },
  sku: { type: String, unique: true, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, trim: true },
  material: { type: String, trim: true },
  color: { type: String, trim: true },
  dimensions: { type: String, trim: true },
  weight: { type: String, trim: true },
  warranty: { type: String, trim: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, bestSeller: 1, newArrival: 1 });
productSchema.index({ name: 'text', description: 'text' });

productSchema.pre('save', function () {
  if (this.salePrice && this.salePrice >= this.price) {
    this.salePrice = undefined;
  }
});

module.exports = getConnection('cluster1').model('Product', productSchema);