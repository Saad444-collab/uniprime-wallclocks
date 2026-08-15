const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ product: 1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = getConnection('cluster5').model('Review', reviewSchema);