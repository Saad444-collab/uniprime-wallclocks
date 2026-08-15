const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const adminActionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String },
  performedAt: { type: Date, default: Date.now }
}, { timestamps: true });

adminActionSchema.index({ admin: 1 });
adminActionSchema.index({ performedAt: -1 });

module.exports = getConnection('cluster8').model('AdminAction', adminActionSchema);