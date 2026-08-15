const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true },
  location: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = getConnection('cluster6').model('Warehouse', warehouseSchema);