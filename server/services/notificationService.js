const { notification, emailLog, analytics, event } = require('../repositories/notificationRepository');
const dbManager = require('../config/databaseManager');

const isReady = () => dbManager.isConnected('cluster7');

async function createNotification({ user, type, title, body, data = {} }) {
  if (!isReady()) return null;
  try {
    return await notification.create({ user, type, title, body, data, isRead: false });
  } catch (e) { return null; }
}

async function logEmail({ to, subject, template, status, error }) {
  if (!isReady()) return null;
  try {
    return await emailLog.create({ to, subject, template, status, error, sentAt: status === 'sent' ? new Date() : undefined });
  } catch (e) { return null; }
}

async function recordEvent(type, data = {}, source) {
  if (!isReady()) return null;
  try {
    return await event.create({ type, data, source, occurredAt: new Date() });
  } catch (e) { return null; }
}

async function recordAnalytics(key, value, category, period) {
  if (!isReady()) return null;
  try {
    return await analytics.create({ key, value, category, period, recordedAt: new Date() });
  } catch (e) { return null; }
}

module.exports = { createNotification, logEmail, recordEvent, recordAnalytics };