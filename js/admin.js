const form = document.getElementById('newsForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const category = document.getElementById('category').value;
  const image = document.getElementById('image').value;

  const news = {
    title,
    content,
    category,
    image,
    date: new Date().toISOString().split('T')[0]
  };

  console.log(news);

  alert('โพสต์ข่าวสำเร็จ');

  form.reset();
});