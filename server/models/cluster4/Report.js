const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

reportSchema.index({ type: 1 });
reportSchema.index({ generatedAt: -1 });

module.exports = getConnection('cluster4').model('Report', reportSchema);