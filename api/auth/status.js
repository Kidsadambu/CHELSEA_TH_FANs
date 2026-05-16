const { isAuthenticated, json } = require('../_newsData');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  json(res, 200, { authenticated: isAuthenticated(req) });
};
