// Static server tối giản để verify website (serve website/dist). Không dep.
// Chạy: node tools/static-server.mjs  (lắng nghe 127.0.0.1:4321)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const ROOT = join(process.cwd(), 'website', 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    let filePath = normalize(join(ROOT, p));
    // Chống path traversal ra khỏi ROOT
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
    try {
      const st = await stat(filePath);
      if (st.isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
      // /tools (không có /) -> thử /tools/
      filePath = join(ROOT, p.replace(/\/$/, '') + '/index.html');
    }
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    const nf = await readFile(join(ROOT, '404.html')).catch(() => Buffer.from('Not found'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(nf);
  }
});

server.listen(4321, '127.0.0.1', () => console.log('Static server: http://127.0.0.1:4321 (serve ' + ROOT + ')'));
