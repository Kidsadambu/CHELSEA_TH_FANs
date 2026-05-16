const { clearSessionCookie, json } = require('./_newsData');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  json(res, 200, { authenticated: false }, { 'Set-Cookie': clearSessionCookie() });
};
