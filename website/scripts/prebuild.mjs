// Prebuild: (1) copy tools data (JSON) sang public/data/ (serve tĩnh),
// (2) đóng gói "Prompt & Template Kit" thành public/downloads/prompt-kit.zip
// để trang /product/ có nút tải hoạt động thật (không bịa link tải).
// Thiếu file nào trong kit -> build THẤT BẠI (không cho tồn tại sản phẩm nửa vời).
import { existsSync, mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptsDir, '..');

// 1) tools.json
const src = join(siteRoot, 'src', 'data', 'tools.json');
const dst = join(siteRoot, 'public', 'data', 'tools.json');
if (!existsSync(src)) {
  console.error('[prebuild] Không tìm thấy src/data/tools.json (tại ' + src + ')');
  process.exit(1);
}
mkdirSync(dirname(dst), { recursive: true });
await writeFile(dst, await readFile(src));
console.log('[prebuild] tools.json -> public/data/tools.json OK');

// 2) Prompt kit zip
const kitDir = join(siteRoot, 'product', 'prompt-kit');
const required = [
  '00-DOC-DAU.md',
  '01-CONG-THUC-3-phan.md',
  '02-MAU-prompts-hoc-tap.md',
  '03-MAU-prompts-cong-viec.md',
  '04-checklist-cong-cu-mien-phi.md',
  '05-huong-dan-dau-tien.md',
];
if (!existsSync(kitDir)) {
  console.error('[prebuild] Không tìm thấy thư mục product/prompt-kit');
  process.exit(1);
}
for (const f of required) {
  if (!existsSync(join(kitDir, f))) {
    console.error(`[prebuild] Thiếu file kit: ${f} (tại ${kitDir})`);
    process.exit(1);
  }
}
const zip = new JSZip();
for (const f of required) {
  zip.file('prompt-kit/' + f, await readFile(join(kitDir, f)));
}
const out = join(siteRoot, 'public', 'downloads', 'prompt-kit.zip');
mkdirSync(dirname(out), { recursive: true });
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
await writeFile(out, buf);
console.log(`[prebuild] prompt-kit.zip -> public/downloads/ (${(buf.length / 1024).toFixed(1)} KB, ${required.length} file) OK`);
