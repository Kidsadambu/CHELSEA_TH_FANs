const NEWS_STORAGE_KEY = 'chelseaThFansNews';
const NEWS_API_BASE = window.NEWS_API_BASE || '';
const NEWS_ADMIN_TOKEN_KEY = 'chelseaThFansAdminToken';

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

function escapeNewsHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNewsDate(dateValue) {
  if (!dateValue) return '';

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(`${dateValue}T00:00:00`));
}

function normalizeArticle(article) {
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

function loadLocalNewsArticles(includeDrafts = true) {
  const storedArticles = window.localStorage.getItem(NEWS_STORAGE_KEY);
  const articles = storedArticles ? JSON.parse(storedArticles) : defaultNewsArticles;
  const normalizedArticles = articles.map(normalizeArticle);
  const filteredArticles = includeDrafts
    ? normalizedArticles
    : normalizedArticles.filter(article => article.status === 'published');

  return sortNewsByDate(filteredArticles);
}

function saveLocalNewsArticles(articles) {
  const normalizedArticles = sortNewsByDate(articles.map(normalizeArticle));
  window.localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(normalizedArticles));
  return normalizedArticles;
}

function getAdminToken() {
  return window.localStorage.getItem(NEWS_ADMIN_TOKEN_KEY) || '';
}

function saveAdminToken(token) {
  window.localStorage.setItem(NEWS_ADMIN_TOKEN_KEY, token || '');
}

function hasApiSupport() {
  return typeof fetch === 'function';
}

async function requestNewsApi(path, options = {}) {
  if (!hasApiSupport()) {
    throw new Error('Fetch API is not available');
  }

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.admin) {
    const token = getAdminToken();
    if (token) headers['X-Admin-Token'] = token;
  }

  const response = await fetch(`${NEWS_API_BASE}${path}`, {
    credentials: 'same-origin',
    ...options,
    headers
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload.error || 'News API request failed');
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function loginAdmin(username, password) {
  return requestNewsApi('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

async function logoutAdmin() {
  return requestNewsApi('/api/logout', {
    method: 'POST'
  });
}

async function getAdminAuthStatus() {
  return requestNewsApi('/api/auth/status');
}

async function loadNewsArticles(includeDrafts = true) {
  try {
    const query = includeDrafts ? '?includeDrafts=true' : '';
    const payload = await requestNewsApi(`/api/news${query}`, { admin: includeDrafts });
    return sortNewsByDate(payload.articles.map(normalizeArticle));
  } catch (error) {
    if (error.status) throw error;
    console.warn('Using local news fallback:', error.message);
    return loadLocalNewsArticles(includeDrafts);
  }
}

async function loadNewsArticle(articleId, includeDrafts = false) {
  try {
    const query = includeDrafts ? '?includeDrafts=true' : '';
    const payload = await requestNewsApi(`/api/news/${encodeURIComponent(articleId)}${query}`, { admin: includeDrafts });
    return normalizeArticle(payload.article);
  } catch (error) {
    if (error.status && error.status !== 404) throw error;
    if (error.status === 404) return null;
    console.warn('Using local article fallback:', error.message);
    return loadLocalNewsArticles(includeDrafts).find(article => article.id === articleId) || null;
  }
}

async function saveNewsArticles(articles) {
  return saveLocalNewsArticles(articles);
}

async function upsertNewsArticle(article) {
  const normalizedArticle = normalizeArticle(article);

  try {
    const method = article.id ? 'PUT' : 'POST';
    const path = method === 'PUT'
      ? `/api/news/${encodeURIComponent(normalizedArticle.id)}`
      : '/api/news';
    const payload = await requestNewsApi(path, {
      method,
      admin: true,
      body: JSON.stringify(normalizedArticle)
    });
    return payload.article ? normalizeArticle(payload.article) : null;
  } catch (error) {
    if (error.status) throw error;
    console.warn('Saving to local news fallback:', error.message);
    const articles = loadLocalNewsArticles(true);
    const existingIndex = articles.findIndex(item => item.id === normalizedArticle.id);

    if (existingIndex >= 0) {
      articles[existingIndex] = normalizedArticle;
    } else {
      articles.unshift(normalizedArticle);
    }

    saveLocalNewsArticles(articles);
    return normalizedArticle;
  }
}

async function deleteNewsArticle(articleId) {
  try {
    await requestNewsApi(`/api/news/${encodeURIComponent(articleId)}`, {
      method: 'DELETE',
      admin: true
    });
    return true;
  } catch (error) {
    if (error.status) throw error;
    console.warn('Deleting from local news fallback:', error.message);
    const articles = loadLocalNewsArticles(true).filter(article => article.id !== articleId);
    saveLocalNewsArticles(articles);
    return true;
  }
}

async function resetNewsArticles() {
  try {
    const payload = await requestNewsApi('/api/news/reset', {
      method: 'POST',
      admin: true
    });
    return sortNewsByDate(payload.articles.map(normalizeArticle));
  } catch (error) {
    if (error.status) throw error;
    console.warn('Resetting local news fallback:', error.message);
    window.localStorage.removeItem(NEWS_STORAGE_KEY);
    return loadLocalNewsArticles(true);
  }
}
