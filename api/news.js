const { getBody, json, normalizeArticle, readArticles, requireAdmin, writeArticles } = require('./_newsData');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query.includeDrafts === 'true';
      if (includeDrafts && !requireAdmin(req, res)) return;

      const articles = await readArticles();
      json(res, 200, {
        articles: includeDrafts ? articles : articles.filter(article => article.status === 'published')
      });
      return;
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const articles = await readArticles();
      const article = normalizeArticle(await getBody(req));
      const nextArticles = [article, ...articles.filter(item => item.id !== article.id)];
      await writeArticles(nextArticles);
      json(res, 201, { article });
      return;
    }

    json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    json(res, 500, { error: error.message || 'Server error' });
  }
};
