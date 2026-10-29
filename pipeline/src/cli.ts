// CLI: node src/cli.ts --topic <id> [--mode draft|review|publish|dry-run]
// Mặc định: mode=draft, topic = chủ đề queued đầu tiên.
// Có lockfile: nếu pipeline đang chạy (không hết timeout) thì không chạy chồng.
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OllamaProvider, type LlmProvider } from './provider.ts';
import { Pipeline, type Mode } from './pipeline.ts';
import { TOPICS, nextTopic } from './topics.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..'); // E:\KIEMTIEN

const env = process.env;
const lockFile = env.PIPELINE_LOCK || path.join(root, 'pipeline', '.lock');

function parseArgs(): { topic?: string; mode: Mode; mock: boolean; list: boolean } {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const modeRaw = get('--mode') ?? env.PIPELINE_MODE ?? 'draft';
  const mode: Mode = ['draft', 'review', 'publish', 'dry-run'].includes(modeRaw) ? (modeRaw as Mode) : 'draft';
  return {
    topic: get('--topic'),
    mode,
    mock: args.includes('--mock') || env.PIPELINE_MOCK === '1',
    list: args.includes('--list-topics'),
  };
}

function acquireLock(): boolean {
  try {
    if (existsSync(lockFile)) {
      const data = JSON.parse(readFileSync(lockFile, 'utf8')) as { pid: number; ts: number };
      const age = Date.now() - data.ts;
      if (age < 30 * 60 * 1000) {
        // Kiểm tra pid có còn không
        try {
          process.kill(data.pid, 0);
          console.error(`[lock] Pipeline khác đang chạy (pid ${data.pid}, ${Math.round(age / 1000)}s). Không chạy chồng.`);
          return false;
        } catch {
          /* pid đã chết -> lock cũ, xoá */
        }
      }
    }
    writeFileSync(lockFile, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    return true;
  } catch (e) {
    console.error('[lock] Không tạo lock:', (e as Error).message);
    return false;
  }
}

async function main() {
  const { topic, mode, mock, list } = parseArgs();

  if (list) {
    for (const t of TOPICS) {
      console.log(`[${t.status === 'done' ? 'x' : ' '}] ${t.id} — ${t.title}`);
    }
    return;
  }

  const selected = topic ? TOPICS.find((t) => t.id === topic) : nextTopic(TOPICS);
  if (!selected) {
    console.error('Không tìm thấy chủ đề. Dùng --list-topics để xem, hoặc --topic <id>.');
    process.exitCode = 2;
    return;
  }

  if (!mock && !acquireLock()) {
    process.exitCode = 3;
    return;
  }

  const cfg = {
    contentDir: path.join(root, 'pipeline', 'drafts'),
    publishDir: path.join(root, 'website', 'src', 'content', 'guides'),
    logDir: path.join(root, 'pipeline', 'logs'),
    websiteRoot: path.join(root, 'website'),
  };

  let provider: LlmProvider;
  if (mock) {
    // Mock "có kịch bản" theo vai trò: writer trả text (đủ dài), reviewer/seo trả JSON
    // hợp lệ — đủ để pipeline (kể cả publish) chạy trọn vẹn mà không cần Ollama.
    // Dùng cho CI (GitHub Actions) và kiểm thử local.
    provider = {
      name: 'mock',
      async isAvailable() {
        return true;
      },
      async generate(prompt: string) {
        if (prompt.includes('BÀI NHÁP CẦN KIỂM TRA')) {
          return JSON.stringify({ pass: true, score: 85, issues: [], fixes: [] });
        }
        if (prompt.includes('Sửa/đề xuất metadata SEO')) {
          return JSON.stringify({ titleOk: true, metaDesc: 'Meta description mock (150-160 ký tự) cho kiểm thử pipeline không cần Ollama.', h1: 'Mock H1', internalLinks: ['/tools/'], notes: 'mock' });
        }
        // Writer
        return '# Bản nháp mock (không cần Ollama)\n\nĐây là nội dung mock có đủ độ dài để vượt ngưỡng 300 ký tự, dùng cho kiểm thử pipeline: ' + 'x'.repeat(400) + '\n\n## Bước 1\nLàm việc A.\n\n## Bước 2\nLàm việc B (liên kết nội bộ [tại đây](/tools/)).\n\n## Tóm tắt\n- x\n- y\n';
      },
    } as LlmProvider;
  } else {
    const p = new OllamaProvider(env.OLLAMA_URL || 'http://127.0.0.1:11434', env.OLLAMA_MODEL || 'qwen2.5:7b', Number(env.OLLAMA_TIMEOUT_MS || 600000));
    if (!(await p.isAvailable())) {
      console.error(`[pipeline] Ollama (model ${p.name}) không sẵn sàng tại ${env.OLLAMA_URL || 'http://127.0.0.1:11434'}. Hãy khởi động ollama serve trước.`);
      process.exitCode = 4;
      if (!mock) try { unlinkSync(lockFile); } catch { /* ignore */ }
      return;
    }
    provider = p;
  }

  const pipeline = new Pipeline(cfg);
  const result = await pipeline.run(provider, selected, mode, TOPICS);
  pipeline.writeLog(selected.id, result);

  console.log('--- KẾT QUẢ ---');
  console.log(`Topic: ${selected.id} | Mode: ${mode} | Passed: ${result.passed} | Score: ${result.score}`);
  if (result.draftPath) console.log(`Nháp: ${result.draftPath}`);
  if (result.publishedPath) console.log(`Đã xuất bản: ${result.publishedPath}`);
  if (result.error) console.log(`LỖI: ${result.error}`);

  process.exitCode = result.passed ? 0 : 1;
  try { unlinkSync(lockFile); } catch { /* ignore */ }
}

main().catch((e) => {
  console.error('Lỗi không mong muốn:', e);
  process.exitCode = 9;
});
