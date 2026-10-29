// Verify monetization trên web công khai (chạy: node tools/verify-monetization.mjs)
const BASE = 'https://legiaptuanson1234-collab.github.io/main/';
const checks = [
  ['Trang /product/', BASE + 'product/', async (t) => t.includes('Prompt') && t.includes('Kit')],
  ['Nút tải zip trong /product/', BASE + 'product/', async (t) => t.includes('downloads/prompt-kit.zip')],
  ['File zip tải được (200)', BASE + 'downloads/prompt-kit.zip', async (_, code) => code === 200],
  ['CTA kit trên trang chủ', BASE, async (t) => t.includes('/main/product/')],
  ['Menu nav có Bộ Prompt Kit', BASE + 'tools/', async (t) => t.includes('Bộ Prompt Kit')],
  ['/affiliates/ (trạng thái + quy trình)', BASE + 'affiliates/', async (t) => t.includes('affiliateUrl') && t.includes('Quy trình bật affiliate')],
  // "liên kết đối tác" xuất hiện trong source JS (cơ chế sẵn) là BÌNH THƯỜNG.
  // Điều cần kiểm chứng: disclosure công khai (đoạn "một số link dưới đây...")
  // chỉ render khi có công cụ có affiliateUrl thật -> hiện tại PHẢI không có.
  ['/tools/ không có disclosure affiliate (vì chưa có chương trình thật)', BASE + 'tools/', async (t) => !t.includes('một số link dưới đây là liên kết đối tác')],
];
let ok = 0;
for (const [name, url, test] of checks) {
  try {
    const res = await fetch(url);
    const body = await res.text();
    const pass = await test(body, res.status);
    console.log(`${pass ? '✅' : '❌'} [${res.status}] ${name}`);
    if (pass) ok++;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}
console.log(`${ok}/${checks.length} đạt.`);
process.exitCode = ok === checks.length ? 0 : 1;
