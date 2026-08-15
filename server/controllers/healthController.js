const dbManager = require('../config/databaseManager');

const getDatabaseHealth = async (req, res) => {
  try {
    const health = dbManager.getHealth();

    const clusters = {};
    for (const [id, c] of Object.entries(health.clusters)) {
      clusters[id] = c.status;
    }

    res.json({
      success: true,
      message: 'Database health status',
      data: {
        status: health.status,
        connected: health.connected,
        total: health.total,
        clusters,
        details: health.clusters,
        checkedAt: health.checkedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const pingDatabases = async (req, res) => {
  try {
    const pings = await dbManager.pingAll();
    res.json({ success: true, data: { pings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCollectionStats = async (req, res) => {
  try {
    const stats = await dbManager.collectionStatsAll();
    res.json({ success: true, data: { stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDatabaseHealth, pingDatabases, getCollectionStats };