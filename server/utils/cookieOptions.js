const getCookieOptions = (overrides = {}) => {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = process.env.COOKIE_SECURE !== undefined
    ? process.env.COOKIE_SECURE === 'true'
    : isProd;
  const sameSite = (process.env.COOKIE_SAME_SITE || 'strict').toLowerCase();
  const domain = process.env.COOKIE_DOMAIN || undefined;

  return {
    httpOnly: true,
    secure,
    sameSite,
    ...(domain ? { domain } : {}),
    ...overrides
  };
};

module.exports = getCookieOptions;