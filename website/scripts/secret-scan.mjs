// Quét secret trong các file đã git-track. Chạy: node website/scripts/secret-scan.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const cwd = 'E:/KIEMTIEN';
const tracked = spawnSync('git', ['ls-files'], { cwd, encoding: 'utf8' }).stdout.split('\n').filter(Boolean);

const patterns = [
  ['OpenAI key', /sk-[A-Za-z0-9]{10,}/],
  ['GitHub token', /ghp_[A-Za-z0-9]{20,}/],
  ['AWS key', /AKIA[0-9A-Z]{16}/],
  ['Slack token', /xox[bap]-[A-Za-z0-9-]+/],
  ['Private key', /-----BEGIN (RSA|OPENSSH|EC) PRIVATE KEY-----/],
  ['API key inline', /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9]{16,}["']/i],
];

let found = 0;
for (const f of tracked) {
  let body;
  try {
    body = readFileSync(`${cwd}/${f}`, 'utf8');
  } catch {
    continue;
  }
  for (const [name, re] of patterns) {
    const m = body.match(re);
    if (m) {
      found++;
      console.log(`CẢNH BÁO ${name} trong ${f}: ${m[0].slice(0, 12)}…`);
    }
  }
}
console.log(found === 0 ? `OK: không tìm thấy secret trong ${tracked.length} file đã track.` : `TÌM THẤY ${found} pattern secret — xem phía trên.`);
process.exitCode = found === 0 ? 0 : 1;
