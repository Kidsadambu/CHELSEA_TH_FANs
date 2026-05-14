const NEWS_STORAGE_KEY = 'chelseaThFansNews';

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

function loadNewsArticles(includeDrafts = true) {
  const storedArticles = window.localStorage.getItem(NEWS_STORAGE_KEY);
  const articles = storedArticles ? JSON.parse(storedArticles) : defaultNewsArticles;
  const normalizedArticles = articles.map(normalizeArticle);
  const filteredArticles = includeDrafts
    ? normalizedArticles
    : normalizedArticles.filter(article => article.status === 'published');

  return sortNewsByDate(filteredArticles);
}

function saveNewsArticles(articles) {
  const normalizedArticles = sortNewsByDate(articles.map(normalizeArticle));
  window.localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(normalizedArticles));
  return normalizedArticles;
}

function upsertNewsArticle(article) {
  const articles = loadNewsArticles(true);
  const normalizedArticle = normalizeArticle(article);
  const existingIndex = articles.findIndex(item => item.id === normalizedArticle.id);

  if (existingIndex >= 0) {
    articles[existingIndex] = normalizedArticle;
  } else {
    articles.unshift(normalizedArticle);
  }

  return saveNewsArticles(articles);
}

function deleteNewsArticle(articleId) {
  const articles = loadNewsArticles(true).filter(article => article.id !== articleId);
  return saveNewsArticles(articles);
}

function resetNewsArticles() {
  window.localStorage.removeItem(NEWS_STORAGE_KEY);
  return loadNewsArticles(true);
}
