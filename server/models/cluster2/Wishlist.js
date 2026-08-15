const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = getConnection('cluster2').model('Wishlist', wishlistSchema);