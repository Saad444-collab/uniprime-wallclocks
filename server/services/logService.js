const { systemLog, activityLog, auditLog, adminAction } = require('../repositories/logRepository');
const dbManager = require('../config/databaseManager');

const isReady = () => dbManager.isConnected('cluster8');

async function logSystem(level, message, details = {}) {
  if (!isReady()) return;
  try {
    await systemLog.create({ level, service: 'api', message, details, occurredAt: new Date() });
  } catch (e) { /* fire-and-forget */ }
}

async function logActivity({ user, action, category, details = {}, ip, userAgent }) {
  if (!isReady()) return;
  try {
    await activityLog.create({ user, action, category, details, ip, userAgent, occurredAt: new Date() });
  } catch (e) { /* fire-and-forget */ }
}

async function logAudit({ user, action, entity, entityId, before, after, ip }) {
  if (!isReady()) return;
  try {
    await auditLog.create({ user, action, entity, entityId, before, after, ip, occurredAt: new Date() });
  } catch (e) { /* fire-and-forget */ }
}

async function logAdminAction({ admin, action, targetType, targetId, details = {}, ip }) {
  if (!isReady()) return;
  try {
    await adminAction.create({ admin, action, targetType, targetId, details, ip, performedAt: new Date() });
  } catch (e) { /* fire-and-forget */ }
}

module.exports = { logSystem, logActivity, logAudit, logAdminAction };