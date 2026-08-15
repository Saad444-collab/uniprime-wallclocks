const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, { retries = 3, delay = 200, shouldRetry = () => true } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      const networkish = !err || !err.name ||
        ['MongoNetworkError', 'MongoNetworkTimeoutError', 'MongooseServerSelectionError', 'MongoServerSelectionError', 'ECONNRESET', 'ETIMEDOUT'].includes(err.name);
      if (attempt === retries || !networkish || !shouldRetry(err)) break;
      await sleep(delay * (attempt + 1));
    }
  }
  throw lastErr;
}

module.exports = { withRetry };