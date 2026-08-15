const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  category: { type: String },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String },
  userAgent: { type: String },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });

activityLogSchema.index({ user: 1 });
activityLogSchema.index({ category: 1 });
activityLogSchema.index({ occurredAt: -1 });

module.exports = getConnection('cluster8').model('ActivityLog', activityLogSchema);