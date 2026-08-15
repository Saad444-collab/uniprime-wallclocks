const clusterModules = [
  require('./mongoCluster1'),
  require('./mongoCluster2'),
  require('./mongoCluster3'),
  require('./mongoCluster4'),
  require('./mongoCluster5'),
  require('./mongoCluster6'),
  require('./mongoCluster7'),
  require('./mongoCluster8')
];

const byId = new Map(clusterModules.map((m) => [m.id, m]));

function getConnection(id) {
  const mod = byId.get(id);
  if (!mod) throw new Error(`Unknown cluster: ${id}`);
  return mod.getConnection();
}

function isConnected(id) {
  const mod = byId.get(id);
  if (!mod) return false;
  return mod.getConnection().readyState === 1;
}

async function initAll() {
  const results = await Promise.allSettled(clusterModules.map((m) => m.connect()));
  const failed = clusterModules.filter((m, i) => results[i].status === 'rejected' || results[i].value === false);

  console.log('\n--- MongoDB Cluster Startup Summary ---');
  for (const m of clusterModules) {
    const s = m.getStatus();
    const state = s.readyState === 1 ? 'Connected' : (s.status === 'not_configured' ? 'Not Configured' : 'Connection Failed');
    console.log(`${s.label} (${s.domain}) -> ${state}${s.host ? ` @ ${s.host}` : ''}${s.dbName ? ` / ${s.dbName}` : ''}`);
  }
  if (failed.length === 0) {
    console.log('All 8 MongoDB clusters connected successfully.');
  } else {
    console.warn(`${failed.length} MongoDB cluster(s) failed to connect.`);
  }
  console.log('--------------------------------------\n');

  return getHealth();
}

function getClusterStatusLabel(mod) {
  const s = mod.getStatus();
  if (s.readyState === 1) return 'connected';
  if (s.status === 'not_configured') return 'not_configured';
  if (s.status === 'failed' || s.status === 'error') return 'connection_failed';
  if (s.status === 'connecting') return 'connecting';
  return 'disconnected';
}

function getHealth() {
  const clusters = {};
  let connected = 0;
  for (const m of clusterModules) {
    const s = m.getStatus();
    const statusLabel = getClusterStatusLabel(m);
    if (s.readyState === 1) connected++;
    clusters[m.id] = {
      status: statusLabel,
      id: m.id,
      label: s.label,
      domain: s.domain,
      host: s.host,
      dbName: s.dbName,
      readyState: s.readyState,
      lastConnected: s.lastConnected,
      error: s.error
    };
  }

  let overall = 'healthy';
  if (connected === 0) overall = 'degraded';
  else if (connected < clusterModules.length) overall = 'partial';

  return {
    status: overall,
    connected,
    total: clusterModules.length,
    clusters,
    checkedAt: new Date().toISOString()
  };
}

async function pingAll() {
  const results = await Promise.allSettled(clusterModules.map((m) => m.ping()));
  return clusterModules.map((m, i) => ({
    id: m.id,
    label: m.getStatus().label,
    ok: results[i].status === 'fulfilled' && results[i].value === true
  }));
}

async function collectionStatsAll() {
  const results = await Promise.allSettled(clusterModules.map((m) => m.collectionStats()));
  return clusterModules.map((m, i) => ({
    id: m.id,
    label: m.getStatus().label,
    ...(results[i].status === 'fulfilled' ? results[i].value : { connected: false })
  }));
}

async function closeAll() {
  await Promise.allSettled(clusterModules.map((m) => m.close()));
}

function getClusters() {
  return clusterModules.map((m) => m.getStatus());
}

module.exports = {
  getConnection,
  isConnected,
  initAll,
  getHealth,
  pingAll,
  collectionStatsAll,
  closeAll,
  getClusters,
  getClusterStatusLabel
};