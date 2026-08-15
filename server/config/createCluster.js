const mongoose = require('mongoose');
const dns = require('dns');
const { getClusterUri, getConnectionOptions, getClusterMeta, sanitizeError } = require('../utils/clusterHelpers');

// Use reliable DNS servers for SRV lookups (Atlas mongodb+srv URIs). The system
// resolver can be flaky/unavailable; public resolvers make cluster connections
// robust. Override with DNS_SERVERS env var (comma-separated) if needed.
const DNS_SERVERS = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map((s) => s.trim()).filter(Boolean);
try {
  dns.setServers(DNS_SERVERS);
} catch (e) {
  console.warn('Failed to set custom DNS servers:', e.message);
}

function createCluster(clusterId) {
  const meta = getClusterMeta(clusterId);

  let connection = null;
  let uri = null;
  let status = 'idle';
  let lastConnected = null;
  let lastError = null;

  const logStatus = (label, message) => {
    console.log(`${label} [${meta.domain}]: ${message}`);
  };

  function getConnection() {
    if (!connection) {
      try {
        uri = getClusterUri(clusterId);
      } catch (e) {
        lastError = sanitizeError(e);
        status = 'not_configured';
      }

      if (!uri) {
        status = 'not_configured';
        lastError = lastError || `No connection URI provided (${meta.envUri} or MONGODB_URI)`;
        connection = mongoose.createConnection();
        return connection;
      }

      connection = mongoose.createConnection(uri, getConnectionOptions());
      status = 'connecting';

      connection.on('connected', () => {
        status = 'connected';
        lastConnected = new Date();
        lastError = null;
        logStatus(meta.label, 'Connected');
      });

      connection.on('disconnected', () => {
        if (status === 'connected') {
          status = 'disconnected';
          logStatus(meta.label, 'Disconnected');
        }
      });

      connection.on('reconnected', () => {
        status = 'connected';
        lastConnected = new Date();
        lastError = null;
        logStatus(meta.label, 'Reconnected');
      });

      connection.on('error', (err) => {
        lastError = sanitizeError(err);
        if (status !== 'connected') {
          status = 'error';
        }
      });
    }
    return connection;
  }

  async function connect(timeoutMs = 30000) {
    const conn = getConnection();

    if (status === 'not_configured') {
      logStatus(meta.label, 'Not configured - skipped');
      return false;
    }

    if (conn.readyState === 1) {
      status = 'connected';
      lastConnected = new Date();
      lastError = null;
      logStatus(meta.label, 'Connected');
      return true;
    }

    return new Promise((resolve) => {
      let settled = false;

      const cleanup = () => {
        clearTimeout(timer);
        conn.off('connected', onConnected);
        conn.off('error', onError);
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        status = 'failed';
        lastError = lastError || 'Connection timed out';
        logStatus(meta.label, `Connection Failed - ${lastError}`);
        resolve(false);
      }, timeoutMs);

      const onConnected = () => {
        if (settled) return;
        settled = true;
        cleanup();
        status = 'connected';
        lastConnected = new Date();
        lastError = null;
        resolve(true);
      };

      const onError = (err) => {
        if (settled) return;
        settled = true;
        cleanup();
        status = 'failed';
        lastError = sanitizeError(err);
        logStatus(meta.label, `Connection Failed - ${lastError}`);
        resolve(false);
      };

      conn.once('connected', onConnected);
      conn.once('error', onError);
    });
  }

  function getStatus() {
    const conn = connection;
    let readyState = conn ? conn.readyState : 0;
    if (status === 'not_configured') readyState = -1;
    return { id: clusterId, ...meta, status, readyState, lastConnected, error: lastError };
  }

  function ping() {
    const conn = connection;
    if (!conn || conn.readyState !== 1) return Promise.resolve(false);
    return conn.db
      .admin()
      .command({ ping: 1 })
      .then(() => true)
      .catch(() => false);
  }

  async function collectionStats() {
    const conn = connection;
    if (!conn || conn.readyState !== 1) return { connected: false };
    const db = conn.db;
    const names = await db.listCollections({}, { nameOnly: true });
    const collections = await names.toArray();
    let documentCount = 0;
    for (const c of collections) {
      try {
        const count = await db.collection(c.name).countDocuments();
        documentCount += count;
      } catch (e) { /* ignore per-collection errors */ }
    }
    return { connected: true, collectionCount: collections.length, documentCount };
  }

  async function close() {
    if (connection) {
      await connection.close();
    }
    connection = null;
    uri = null;
    status = 'idle';
  }

  return { id: clusterId, getConnection, connect, close, getStatus, ping, collectionStats };
}

module.exports = createCluster;