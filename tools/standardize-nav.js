const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'Managers.html',
  'Trophy.html',
  'chapter.html',
  'squad.html',
  'icon.html',
  'latest.html'
];

const navItems = [
  ['index.html', '🏠 หน้าหลัก'],
  ['latest.html', '📰 ข่าวล่าสุด'],
  ['squad.html', '👥 รายชื่อนักเตะ'],
  ['Managers.html', '👔 ผู้จัดการทีม'],
  ['icon.html', '👑 ตำนาน'],
  ['chapter.html', '📖 Chapter Story'],
  ['Trophy.html', '🏆 ทำเนียบแชมป์']
];

function activeClass(file, href) {
  return file.toLowerCase() === href.toLowerCase() ? ' class="active"' : '';
}

function buildNav(file) {
  const lis = navItems
    .map(([href, label]) => `      <li><a href="${href}"${activeClass(file, href)}>${label}</a></li>`)
    .join('\n');
  return `  <nav class="main-nav">\n    <ul class="nav-list">\n${lis}\n    </ul>\n  </nav>`;
}

const navPattern = /\s*<nav\s+class=["']main-nav["'][\s\S]*?<\/nav>/i;

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP missing ${file}`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const nextNav = '\n' + buildNav(file) + '\n';
  let updated;

  if (navPattern.test(original)) {
    updated = original.replace(navPattern, nextNav);
  } else {
    updated = original.replace(/<body[^>]*>/i, match => `${match}${nextNav}`);
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`UPDATED ${file}`);
  } else {
    console.log(`NOCHANGE ${file}`);
  }
}
