const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const analyticsSchema = new mongoose.Schema({
  key: { type: String, required: true },
  category: { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
  period: { type: String },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

analyticsSchema.index({ key: 1 });
analyticsSchema.index({ recordedAt: -1 });

module.exports = getConnection('cluster7').model('Analytics', analyticsSchema);