const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  source: { type: String },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });

eventSchema.index({ type: 1 });
eventSchema.index({ occurredAt: -1 });

module.exports = getConnection('cluster7').model('Event', eventSchema);