const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = getConnection('cluster1').model('Category', categorySchema);