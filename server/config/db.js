const dbManager = require('./databaseManager');

const connectDB = async () => {
  const health = await dbManager.initAll();
  if (health.connected === 0) {
    throw new Error('No MongoDB clusters could be connected');
  }
  return dbManager;
};

module.exports = connectDB;