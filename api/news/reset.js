const { defaultNewsArticles, json, normalizeArticle, requireAdmin, sortNewsByDate, writeArticles } = require('../_newsData');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (!requireAdmin(req, res)) return;

    const articles = sortNewsByDate(defaultNewsArticles.map(normalizeArticle));
    await writeArticles(articles);
    json(res, 200, { articles });
  } catch (error) {
    json(res, 500, { error: error.message || 'Server error' });
  }
};
