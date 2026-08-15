const CLUSTER_DEFINITIONS = [
  { id: 'cluster1', label: 'Cluster 1', domain: 'Catalog', envUri: 'MONGO_CLUSTER_1_URI', envDb: 'MONGO_DB_NAME_CLUSTER_1', defaultDb: 'uniprime_wall_clocks_c1' },
  { id: 'cluster2', label: 'Cluster 2', domain: 'Users', envUri: 'MONGO_CLUSTER_2_URI', envDb: 'MONGO_DB_NAME_CLUSTER_2', defaultDb: 'uniprime_wall_clocks_c2' },
  { id: 'cluster3', label: 'Cluster 3', domain: 'Orders', envUri: 'MONGO_CLUSTER_3_URI', envDb: 'MONGO_DB_NAME_CLUSTER_3', defaultDb: 'uniprime_wall_clocks_c3' },
  { id: 'cluster4', label: 'Cluster 4', domain: 'Reports', envUri: 'MONGO_CLUSTER_4_URI', envDb: 'MONGO_DB_NAME_CLUSTER_4', defaultDb: 'uniprime_wall_clocks_c4' },
  { id: 'cluster5', label: 'Cluster 5', domain: 'Reviews', envUri: 'MONGO_CLUSTER_5_URI', envDb: 'MONGO_DB_NAME_CLUSTER_5', defaultDb: 'uniprime_wall_clocks_c5' },
  { id: 'cluster6', label: 'Cluster 6', domain: 'Inventory', envUri: 'MONGO_CLUSTER_6_URI', envDb: 'MONGO_DB_NAME_CLUSTER_6', defaultDb: 'uniprime_wall_clocks_c6' },
  { id: 'cluster7', label: 'Cluster 7', domain: 'Notifications & Analytics', envUri: 'MONGO_CLUSTER_7_URI', envDb: 'MONGO_DB_NAME_CLUSTER_7', defaultDb: 'uniprime_wall_clocks_c7' },
  { id: 'cluster8', label: 'Cluster 8', domain: 'System & Audit', envUri: 'MONGO_CLUSTER_8_URI', envDb: 'MONGO_DB_NAME_CLUSTER_8', defaultDb: 'uniprime_wall_clocks_c8' }
];

const SECRET_PATTERNS = [
  /(mongodb(\+srv)?:\/\/[^\s@/]+:)[^@\s/]+(@)/gi,
  /([?&](?:pwd|password|pass)=)[^&\s]+/gi
];

function sanitizeError(err) {
  if (!err) return 'Unknown error';
  let msg = (err && (err.message || String(err))) || 'Unknown error';
  for (const re of SECRET_PATTERNS) {
    msg = msg.replace(re, '$1****$3');
  }
  return msg;
}

function getClusterDefinition(id) {
  const def = CLUSTER_DEFINITIONS.find((c) => c.id === id);
  if (!def) throw new Error(`Unknown cluster: ${id}`);
  return def;
}

function getEnvDbName(id) {
  const def = getClusterDefinition(id);
  return process.env[def.envDb] || def.defaultDb;
}

function withDbName(uri, dbName) {
  if (!uri || !dbName) return uri;
  try {
    const url = new URL(uri);
    const segs = url.pathname.split('/').filter(Boolean);
    if (segs.length > 0) segs[0] = dbName;
    else segs.unshift(dbName);
    url.pathname = '/' + segs.join('/');
    return url.toString();
  } catch (e) {
    // WHATWG URL rejects comma-separated hosts (Atlas replica set URIs),
    // so fall back to a manual string rewrite.
    const qIdx = uri.indexOf('?');
    const query = qIdx >= 0 ? uri.slice(qIdx) : '';
    let core = qIdx >= 0 ? uri.slice(0, qIdx) : uri;
    const atIdx = core.lastIndexOf('@');
    const hostsEnd = atIdx >= 0 ? atIdx + 1 : (core.indexOf('//') >= 0 ? core.indexOf('//') + 2 : 0);
    const firstSlash = core.indexOf('/', hostsEnd);
    if (firstSlash >= 0) {
      const dbEnd = core.indexOf('/', firstSlash + 1);
      core = core.slice(0, firstSlash + 1) + dbName + (dbEnd >= 0 ? core.slice(dbEnd) : '');
    } else {
      core = core + '/' + dbName;
    }
    return core + query;
  }
}

function getBaseUri() {
  return process.env.MONGODB_URI || process.env.MONGODB_URI_PROD || '';
}

function getClusterUri(id) {
  const def = getClusterDefinition(id);
  const explicit = process.env[def.envUri];
  if (explicit) return withDbName(explicit, getEnvDbName(id));
  const base = getBaseUri();
  if (!base) return null;
  return withDbName(base, getEnvDbName(id));
}

function getConnectionOptions() {
  return {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0,
    autoIndex: true,
    family: 4
  };
}

function getClusterMeta(id) {
  const def = getClusterDefinition(id);
  const uri = getClusterUri(id);
  let host = null;
  let dbName = getEnvDbName(id);
  if (uri) {
    try {
      const url = new URL(uri);
      host = url.hostname;
      const segs = url.pathname.split('/').filter(Boolean);
      if (segs.length) dbName = segs[0];
    } catch (e) { /* keep defaults */ }
  }
  return { ...def, host, dbName, uriConfigured: Boolean(uri) };
}

module.exports = {
  CLUSTER_DEFINITIONS,
  getClusterDefinition,
  getClusterUri,
  getConnectionOptions,
  getClusterMeta,
  getEnvDbName,
  withDbName,
  sanitizeError
};
