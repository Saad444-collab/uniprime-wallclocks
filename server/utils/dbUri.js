const getDbUri = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MONGODB_URI_PROD) {
      throw new Error('MONGODB_URI_PROD is required in production');
    }
    return process.env.MONGODB_URI_PROD;
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }
  return process.env.MONGODB_URI;
};

module.exports = getDbUri;