import { readFileSync } from 'node:fs';
const h = readFileSync('E:/KIEMTIEN/website/dist/tools/index.html', 'utf8');
console.log('có "ChatGPT":', h.includes('ChatGPT'));
console.log('có "Miễn phí":', h.includes('Miễn phí'));
console.log('có "trợ lý":', h.includes('trợ lý'));
// Tìm chuỗi JSON escape (unicode) — Astro có thể escape tiếng Việt
const m = h.match(/\\u00e0/g);
console.log('có unicode escapes:', m ? m.length : 0);
// Tìm biến categories/tools
const i = h.indexOf('categories');
console.log('vị trí "categories":', i);
if (i > 0) console.log('context categories:', h.slice(Math.max(0, i - 150), i + 250).replace(/\n/g, ' '));
