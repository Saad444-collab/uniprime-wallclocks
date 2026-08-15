const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true },
  logo: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = getConnection('cluster1').model('Brand', brandSchema);