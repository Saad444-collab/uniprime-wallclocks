const { getCurrencyForCountry, DEFAULT_CURRENCY } = require('../utils/currencyConfig');
const http = require('http');
const https = require('https');

const geoCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;
const CACHE_MAX = 2000;

function getClientIp(req) {
  let ip = req.ip;
  if (ip) ip = String(ip).split(',')[0].trim();
  if (!ip || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
    return null;
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
}

function detectPrivateIp(ip) {
  if (!ip) return true;
  const parts = ip.split('.');
  if (parts.length === 4) {
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 0) return true;
  }
  return false;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function geolocateIp(ip) {
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.countryCode;
  }

  try {
    const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : null;
    let countryCode = null;

    if (fetchFn) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetchFn(`http://ip-api.com/json/${ip}?fields=countryCode,status`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') countryCode = data.countryCode;
      }
    } else {
      const data = await httpGet(`http://ip-api.com/json/${ip}?fields=countryCode,status`);
      const parsed = JSON.parse(data);
      if (parsed.status === 'success') countryCode = parsed.countryCode;
    }

    if (countryCode) {
      if (geoCache.size >= CACHE_MAX) {
        const oldestKey = geoCache.keys().next().value;
        geoCache.delete(oldestKey);
      }
      geoCache.set(ip, { countryCode, time: Date.now() });
      return countryCode;
    }
  } catch (e) {
    // IP detection failed silently
  }
  return null;
}

async function currencyMiddleware(req, res, next) {
  try {
    if (process.env.NODE_ENV === 'development' && req.query.test_country) {
      const testCode = req.query.test_country.toUpperCase();
      req.countryCode = testCode;
      req.currencyCode = getCurrencyForCountry(testCode);
      return next();
    }

    const clientIp = getClientIp(req);

    if (detectPrivateIp(clientIp)) {
      req.countryCode = null;
      req.currencyCode = DEFAULT_CURRENCY;
      return next();
    }

    const countryCode = await geolocateIp(clientIp);
    req.countryCode = countryCode;
    req.currencyCode = getCurrencyForCountry(countryCode);
    next();
  } catch (e) {
    req.countryCode = null;
    req.currencyCode = DEFAULT_CURRENCY;
    next();
  }
}

module.exports = currencyMiddleware;
