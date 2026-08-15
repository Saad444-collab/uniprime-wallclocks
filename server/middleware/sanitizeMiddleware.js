const mongoSanitize = require('express-mongo-sanitize');

module.exports = function (options) {
  return function (req, res, next) {
    ['body', 'params', 'query'].forEach(function (key) {
      if (req[key] && typeof req[key] === 'object') {
        req[key] = mongoSanitize.sanitize(req[key], options);
      }
    });
    next();
  };
};
