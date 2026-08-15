const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const emailLogSchema = new mongoose.Schema({
  to: { type: String },
  subject: { type: String },
  template: { type: String },
  status: { type: String, enum: ['sent', 'failed', 'queued'], default: 'queued' },
  error: { type: String },
  sentAt: { type: Date }
}, { timestamps: true });

emailLogSchema.index({ status: 1 });
emailLogSchema.index({ createdAt: -1 });

module.exports = getConnection('cluster7').model('EmailLog', emailLogSchema);