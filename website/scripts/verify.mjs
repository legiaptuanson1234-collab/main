import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Giải quyết đường dẫn tương đối từ script này (website/dist), không hard-code ổ đĩa.
const here = dirname(fileURLToPath(import.meta.url));
const base = resolve(here, '..', 'dist');
const p1 = readFileSync(join(base, 'index.html'), 'utf8');
console.log('H1 trang chủ OK:', p1.includes('Không cần tiền. Không cần thẻ'));
const p2 = readFileSync(join(base, 'guides', 'index.html'), 'utf8');
console.log('Số article ở /guides/:', (p2.match(/<article class="card"/g) || []).length);
console.log('Có link bài 10 phút:', p2.includes('cach-dung-ai-mien-phi-trong-10-phut'));
const p4 = readFileSync(join(base, 'guides', 'cach-dung-ai-mien-phi-trong-10-phut', 'index.html'), 'utf8');
console.log('Guide UTF-8 đúng:', p4.includes('Cách dùng AI miễn phí trong 10 phút'));
const p5 = readFileSync(join(base, 'guides', 'feed.xml'), 'utf8');
console.log('RSS số item:', (p5.match(/<item>/g) || []).length);
console.log('robots.txt đúng:', readFileSync(join(base, 'robots.txt'), 'utf8').includes('/data/'));
const sm = readFileSync(join(base, 'sitemap-index.xml'), 'utf8');
console.log('sitemap-index có:', sm.includes('sitemap-0.xml'));
