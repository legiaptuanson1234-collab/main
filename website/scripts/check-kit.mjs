import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const dir = 'E:/KIEMTIEN/website/product/prompt-kit';
let bad = 0;
for (const f of readdirSync(dir).sort()) {
  const c = readFileSync(path.join(dir, f), 'utf8');
  // UTF-8 hợp lệ nếu không có NUL và có ký tự tiếng Việt (broad char)
  const hasNul = c.includes('\u0000');
  const hasVi = /[ầấẩẫậơư đ àáảãạèéẻẽẹìíỉĩịôởịơóỏõọùúủũự]/.test(c);
  console.log(`${f.padEnd(38)} chars=${String(c.length).padEnd(7)} nul=${hasNul} viet=${hasVi}`);
  if (hasNul) bad++;
}
console.log(bad === 0 ? 'OK: toàn bộ file kit là UTF-8 sạch.' : `LỖI: ${bad} file có NUL.`);
