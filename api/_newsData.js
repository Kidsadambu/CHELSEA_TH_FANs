const crypto = require('crypto');

const NEWS_KEY = 'chelsea:news:articles';
const COOKIE_NAME = 'chelsea_admin_session';
const SESSION_MAX_AGE_SECONDS = Number(process.env.SESSION_MAX_AGE_SECONDS || 86400);

const defaultNewsArticles = [
  {
    id: 'chelsea-transfer-plan-2026',
    title: 'Chelsea เตรียมแผนเสริมทัพก่อนฤดูกาลใหม่',
    category: 'ทีมชาย',
    author: 'ทีมข่าว CHELSEA TH FANs',
    date: '2026-05-14',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop',
    summary: 'สโมสรเดินหน้าวางโครงสร้างทีมระยะยาว พร้อมประเมินผู้เล่นในตำแหน่งหลักเพื่อยกระดับการแข่งขันทั้งในประเทศและเวทียุโรป',
    content: 'Chelsea วางแนวทางการเสริมทัพโดยเน้นผู้เล่นที่เข้ากับระบบทีมและมีศักยภาพเติบโตในระยะยาว ทีมงานจะประเมินสมดุลของขุมกำลังเดิมก่อนตัดสินใจในตลาดซื้อขาย เพื่อให้ทีมพร้อมแข่งขันต่อเนื่องตลอดฤดูกาล',
    status: 'published',
    featured: true
  },
  {
    id: 'chelsea-women-standard-2026',
    title: 'Chelsea Women เดินหน้าสร้างมาตรฐานใหม่',
    category: 'ทีมหญิง',
    author: 'ทีมข่าว CHELSEA TH FANs',
    date: '2026-05-13',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop',
    summary: 'ทีมหญิงยังเป็นหนึ่งในแกนหลักของโปรเจกต์สโมสร ด้วยผลงานต่อเนื่องและโครงสร้างทีมที่แข็งแรงในทุกตำแหน่ง',
    content: 'Chelsea Women ยังคงรักษามาตรฐานระดับสูงผ่านระบบการฝึกซ้อม การบริหารทีม และการผลักดันผู้เล่นรุ่นใหม่ แฟนบอลชาวไทยสามารถติดตามความเคลื่อนไหวของทีมได้ในหน้าข่าวล่าสุดของเว็บไซต์',
    status: 'published',
    featured: false
  },
  {
    id: 'academy-first-team-training-2026',
    title: 'อะคาเดมีดันดาวรุ่งขึ้นซ้อมทีมชุดใหญ่',
    category: 'อะคาเดมี',
    author: 'ทีมข่าว CHELSEA TH FANs',
    date: '2026-05-12',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200&auto=format&fit=crop',
    summary: 'นักเตะเยาวชนหลายรายได้รับโอกาสเรียนรู้กับทีมชุดใหญ่ หลังทำผลงานโดดเด่นในระบบพัฒนาเยาวชนของสโมสร',
    content: 'ทีมอะคาเดมีของ Chelsea ยังคงเป็นฐานสำคัญในการพัฒนาผู้เล่นสู่ทีมชุดใหญ่ การได้ซ้อมร่วมกับนักเตะระดับสูงช่วยให้ดาวรุ่งเข้าใจความเร็วและมาตรฐานของเกมอาชีพมากขึ้น',
    status: 'published',
    featured: false
  }
];

function createNewsSlug(text) {
  const slug = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u0E00-\u0E7F-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `news-${Date.now()}`;
}

function normalizeArticle(article = {}) {
  const title = article.title || 'Untitled News';

  return {
    id: article.id || `${createNewsSlug(title)}-${Date.now()}`,
    title,
    category: article.category || 'ข่าวสโมสร',
    author: article.author || 'Admin',
    date: article.date || new Date().toISOString().slice(0, 10),
    image: article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    summary: article.summary || '',
    content: article.content || '',
    status: article.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(article.featured)
  };
}

function sortNewsByDate(articles) {
  return [...articles].sort((first, second) => new Date(second.date) - new Date(first.date));
}

function hasKvConfig() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCommand(command) {
  if (!hasKvConfig()) {
    throw new Error('Vercel KV is not configured');
  }

  const response = await fetch(process.env.KV_REST_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || 'Vercel KV request failed');
  }

  return payload.result;
}

async function readArticles() {
  if (!hasKvConfig()) {
    return sortNewsByDate(defaultNewsArticles.map(normalizeArticle));
  }

  const storedArticles = await kvCommand(['GET', NEWS_KEY]);
  if (!storedArticles) {
    const seededArticles = sortNewsByDate(defaultNewsArticles.map(normalizeArticle));
    await writeArticles(seededArticles);
    return seededArticles;
  }

  const parsedArticles = typeof storedArticles === 'string' ? JSON.parse(storedArticles) : storedArticles;
  return sortNewsByDate(parsedArticles.map(normalizeArticle));
}

async function writeArticles(articles) {
  if (!hasKvConfig()) {
    throw new Error('กรุณาเชื่อม Vercel KV เพื่อให้ข่าวที่บันทึกเผยแพร่ให้คนทั่วโลกเห็น');
  }

  const normalizedArticles = sortNewsByDate(articles.map(normalizeArticle));
  await kvCommand(['SET', NEWS_KEY, JSON.stringify(normalizedArticles)]);
  return normalizedArticles;
}

function json(res, statusCode, payload, headers = {}) {
  res.statusCode = statusCode;
  Object.entries({ 'Content-Type': 'application/json; charset=utf-8', ...headers }).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });
    req.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map(cookie => cookie.trim())
      .filter(Boolean)
      .map(cookie => {
        const [name, ...value] = cookie.split('=');
        return [name, value.join('=')];
      })
  );
}

function timingSafeEqual(firstValue, secondValue) {
  const first = Buffer.from(String(firstValue));
  const second = Buffer.from(String(secondValue));
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'change-this-session-secret';
}

function sign(value) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function createSessionCookie() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 })).toString('base64url');
  const signature = sign(payload);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `chelsea_admin_session=${payload}.${signature}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Strict${secure}`;
}

function clearSessionCookie() {
  return 'chelsea_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict';
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  const session = cookies.chelsea_admin_session || '';
  const [payload, signature] = session.split('.');

  if (payload && signature && timingSafeEqual(sign(payload), signature)) {
    try {
      const parsedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (parsedPayload.role === 'admin' && parsedPayload.exp > Date.now()) return true;
    } catch (error) {
      return false;
    }
  }

  const token = req.headers['x-admin-token'];
  return Boolean(process.env.ADMIN_TOKEN && token && timingSafeEqual(token, process.env.ADMIN_TOKEN));
}

function requireAdmin(req, res) {
  if (isAuthenticated(req)) return true;
  json(res, 401, { error: 'กรุณาเข้าสู่ระบบ Admin ก่อน' });
  return false;
}

function verifyAdminCredentials(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME || 'kaebmoopingkai3737';
  const adminPassword = process.env.ADMIN_PASSWORD || '1234567890';
  return timingSafeEqual(username, adminUsername) && timingSafeEqual(password, adminPassword);
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  defaultNewsArticles,
  getBody,
  isAuthenticated,
  json,
  normalizeArticle,
  readArticles,
  requireAdmin,
  sortNewsByDate,
  verifyAdminCredentials,
  writeArticles
};
