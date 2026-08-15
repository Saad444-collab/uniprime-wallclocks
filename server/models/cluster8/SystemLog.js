const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const systemLogSchema = new mongoose.Schema({
  level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
  service: { type: String },
  message: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });

systemLogSchema.index({ level: 1 });
systemLogSchema.index({ service: 1 });
systemLogSchema.index({ occurredAt: -1 });

module.exports = getConnection('cluster8').model('SystemLog', systemLogSchema);