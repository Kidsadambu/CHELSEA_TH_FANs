const { createSessionCookie, getBody, json, verifyAdminCredentials } = require('./_newsData');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await getBody(req);
    if (!verifyAdminCredentials(String(body.username || ''), String(body.password || ''))) {
      json(res, 401, { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    json(res, 200, { authenticated: true }, { 'Set-Cookie': createSessionCookie() });
  } catch (error) {
    json(res, 500, { error: error.message || 'Server error' });
  }
};
