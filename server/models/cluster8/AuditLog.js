const mongoose = require('mongoose');
const { getConnection } = require('../../config/databaseManager');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String },
  entityId: { type: String },
  before: { type: mongoose.Schema.Types.Mixed, default: {} },
  after: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ occurredAt: -1 });

module.exports = getConnection('cluster8').model('AuditLog', auditLogSchema);