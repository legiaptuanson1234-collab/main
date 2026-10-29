// Prebuild: copy tools data (JSON) sang public/data/ để được serve tĩnh.
// Dữ liệu cũng được nhúng sẵn vào trang /tools/ (filter client-side chạy không cần fetch).
// Pipeline nội dung chỉ cần sửa src/data/tools.json, chạy build là tự đồng bộ.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptsDir, '..');
const src = join(siteRoot, 'src', 'data', 'tools.json');
const dst = join(siteRoot, 'public', 'data', 'tools.json');

if (!existsSync(src)) {
  console.error('[prebuild] Không tìm thấy src/data/tools.json (tại ' + src + ')');
  process.exit(1);
}
mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log('[prebuild] tools.json -> public/data/tools.json OK');
