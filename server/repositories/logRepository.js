const { ActivityLog, AuditLog, SystemLog, AdminAction } = require('../models').cluster8;
const createBaseRepository = require('../utils/baseRepository');

const activityLog = createBaseRepository(ActivityLog);
const auditLog = createBaseRepository(AuditLog);
const systemLog = createBaseRepository(SystemLog);
const adminAction = createBaseRepository(AdminAction);

module.exports = {
  cluster: 'cluster8',
  models: { ActivityLog, AuditLog, SystemLog, AdminAction },
  activityLog,
  auditLog,
  systemLog,
  adminAction
};