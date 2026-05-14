async function loadNews(url, containerId) {
  const response = await fetch(url);
  const news = await response.json();

  const container = document.getElementById(containerId);

  news.forEach(item => {
    container.innerHTML += `
      <div class="news-card">
        <img src="${item.image}" alt="${item.title}">

        <div class="news-content">
          <h3>${item.title}</h3>
          <p>${item.content}</p>
          <div class="news-date">${item.date}</div>
        </div>
      </div>
    `;
  });
}

loadNews('data/mens-news.json', 'mens-news');
loadNews('data/womens-news.json', 'womens-news');