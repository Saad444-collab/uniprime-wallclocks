const { Notification, EmailLog, Analytics, Event } = require('../models').cluster7;
const createBaseRepository = require('../utils/baseRepository');

const notification = createBaseRepository(Notification);
const emailLog = createBaseRepository(EmailLog);
const analytics = createBaseRepository(Analytics);
const event = createBaseRepository(Event);

module.exports = {
  cluster: 'cluster7',
  models: { Notification, EmailLog, Analytics, Event },
  notification,
  emailLog,
  analytics,
  event
};