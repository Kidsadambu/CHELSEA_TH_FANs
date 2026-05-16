const { getBody, json, normalizeArticle, readArticles, requireAdmin, writeArticles } = require('../_newsData');

module.exports = async function handler(req, res) {
  try {
    const articleId = req.query.id;

    if (req.method === 'GET') {
      const includeDrafts = req.query.includeDrafts === 'true';
      if (includeDrafts && !requireAdmin(req, res)) return;

      const articles = await readArticles();
      const article = articles.find(item => item.id === articleId && (includeDrafts || item.status === 'published'));
      if (!article) {
        json(res, 404, { error: 'Article not found' });
        return;
      }
      json(res, 200, { article });
      return;
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const body = await getBody(req);
      const article = normalizeArticle({ ...body, id: articleId });
      const articles = await readArticles();
      const nextArticles = [article, ...articles.filter(item => item.id !== articleId)];
      await writeArticles(nextArticles);
      json(res, 200, { article });
      return;
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;
      const articles = await readArticles();
      await writeArticles(articles.filter(article => article.id !== articleId));
      json(res, 200, { deleted: true });
      return;
    }

    json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    json(res, 500, { error: error.message || 'Server error' });
  }
};
