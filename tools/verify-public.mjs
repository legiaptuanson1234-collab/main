// Xác minh website công khai trên GitHub Pages
const BASE = 'https://legiaptuanson1234-collab.github.io/main/';
const checks = [
  ['Trang chủ', BASE, (h) => h.includes('Không cần tiền. Không cần thẻ')],
  ['/tools/ (filter + data)', BASE + 'tools/', (h) => h.includes('freeTier') && h.includes('ChatGPT') && h.includes('chip-row')],
  ['/guides/ (3 bài)', BASE + 'guides/', (h) => (h.match(/<article class="card"/g) || []).length === 3],
  ['1 bài hướng dẫn (UTF-8)', BASE + 'guides/cach-dung-ai-mien-phi-trong-10-phut/', (h) => h.includes('Cách dùng AI miễn phí trong 10 phút')],
  ['sitemap-index.xml', BASE + 'sitemap-index.xml', (h) => h.includes('sitemap-0.xml')],
  ['sitemap trỏ đúng domain', BASE + 'sitemap-0.xml', (h) => h.includes('legiaptuanson1234-collab.github.io/main/')],
  ['robots.txt', BASE + 'robots.txt', (h) => h.includes('Disallow: /data/')],
  ['RSS', BASE + 'guides/feed.xml', (h) => (h.match(/<item>/g) || []).length === 3],
  ['404 page', 'https://legiaptuanson1234-collab.github.io/main/trang-khong-ton-tai/', (h) => h.includes('Trang này không tồn tại') || h.includes('404')],
];

let ok = 0;
for (const [name, url, test] of checks) {
  try {
    const res = await fetch(url);
    const body = await res.text();
    const pass = test(body);
    console.log(`${pass ? '✅' : '❌'} [${res.status}] ${name}`);
    if (pass) ok++;
  } catch (e) {
    console.log(`❌ LỖI fetch ${name}: ${e.message}`);
  }
}
console.log(`\n${ok}/${checks.length} kiểm tra đạt.`);
process.exitCode = ok === checks.length ? 0 : 1;
