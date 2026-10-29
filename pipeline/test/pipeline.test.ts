// Test suite pipeline — chạy: node --test pipeline/test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Pipeline } from '../src/pipeline.ts';
import { MockProvider } from '../src/provider.ts';
import { TOPICS, nextTopic, slugify } from '../src/topics.ts';

function makeCmp() {
  const d = mkdtempSync(path.join(tmpdir(), 'pipe-test-'));
  mkdirSync(path.join(d, 'drafts'), { recursive: true });
  return {
    dir: d,
    cfg: {
      contentDir: path.join(d, 'drafts'),
      publishDir: path.join(d, 'guides'),
      logDir: path.join(d, 'logs'),
      websiteRoot: d,
    },
  };
}

// Provider giả trả đúng kịch bản cho từng vai trò
class ScriptedProvider extends MockProvider {
  async generate(prompt: string) {
    if (prompt.includes('Nhiệm vụ: viết bài')) {
      return '# Bài test\n\nNội dung bài test có đủ độ dài để vượt qua ngưỡng 300 ký tự: ' + 'a'.repeat(500) + '\n\nPhần 1: [hướng dẫn](/tools/)\n\n## Tóm tắt\n- 1 bước';
    }
    if (prompt.includes('BÀI NHÁP CẦN KIỂM TRA')) {
      return JSON.stringify({ pass: true, score: 80, issues: [], fixes: [] });
    }
    if (prompt.includes('Sửa/đề xuất metadata SEO')) {
      return JSON.stringify({ titleOk: true, metaDesc: 'Meta description test', h1: 'H1 test', internalLinks: ['/tools/'], notes: 'ok' });
    }
    return 'không rõ vai trò';
  }
}

test('slugify tiếng Việt', () => {
  assert.equal(slugify('Cách viết prompt để AI trả lời đúng ý'), 'cach-viet-prompt-de-ai-tra-loi-dung-y');
  assert.equal(slugify('Điểm & giá — 100%'), 'diem-gia-100');
});

test('nextTopic chọn chủ đề queued đầu tiên', () => {
  const t = nextTopic(TOPICS);
  assert.ok(t);
  assert.equal(t.status, 'queued');
});

test('dry-run KHÔNG ghi file, KHÔNG publish', async () => {
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const r = await p.run(new ScriptedProvider(), TOPICS[0], 'dry-run', TOPICS);
  assert.equal(r.passed, true);
  assert.equal(r.publishedPath, undefined);
  assert.equal(r.draftPath, undefined);
  assert.ok(!existsSync(path.join(cfg.contentDir, r.slug + '.md')));
});

test('draft lưu file nháp nhưng không publish', async () => {
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const r = await p.run(new ScriptedProvider(), TOPICS[0], 'draft', TOPICS);
  assert.equal(r.passed, true);
  assert.ok(r.draftPath);
  assert.ok(existsSync(r.draftPath!));
  assert.equal(r.publishedPath, undefined);
});

test('review: lưu nháp + báo passed theo score', async () => {
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const r = await p.run(new ScriptedProvider(), TOPICS[0], 'review', TOPICS);
  assert.equal(r.passed, true); // reviewer scripted: pass=true, score=80
  assert.ok(r.draftPath && existsSync(r.draftPath));
});

test('publish: chỉ xuất bản khi đạt ngưỡng; ghi frontmatter', async () => {
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const r = await p.run(new ScriptedProvider(), TOPICS[0], 'publish', TOPICS);
  assert.equal(r.passed, true);
  assert.ok(r.publishedPath && existsSync(r.publishedPath));
  const md = readFileSync(r.publishedPath!, 'utf8');
  assert.ok(md.startsWith('---'));
  assert.ok(md.includes('status: "draft"'));
  assert.ok(md.includes('aiLabel: "ai-assisted"'));
});

test('publish bị chặn khi reviewer không pass (không ghi file)', async () => {
  class FailReviewer extends MockProvider {
    async generate(prompt: string) {
      if (prompt.includes('BÀI NHÁP CẦN KIỂM TRA')) return JSON.stringify({ pass: false, score: 20, issues: ['bịa số liệu'], fixes: [] });
      return '# Bài\n\n' + 'a'.repeat(500);
    }
  }
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const r = await p.run(new FailReviewer(), TOPICS[0], 'publish', TOPICS);
  assert.equal(r.passed, false);
  assert.equal(r.publishedPath, undefined);
  assert.ok(r.draftPath); // nháp vẫn được lưu để sửa
});

test('slug trùng bị chặn', async () => {
  class P extends MockProvider {
    async generate(prompt: string) {
      if (prompt.includes('BÀI NHÁP CẦN KIỂM TRA')) return JSON.stringify({ pass: true, score: 90, issues: [], fixes: [] });
      return '# Bài\n\n' + 'a'.repeat(500);
    }
  }
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const fake: typeof TOPICS = [
    { ...TOPICS[0], id: 'other-topic' },
    TOPICS[0],
  ];
  const r = await p.run(new P(), TOPICS[0], 'draft', fake);
  // slug của TOPICS[0] trùng slug của 'other-topic' (cùng title)
  assert.ok(r.error && r.error.includes('trùng'));
});

test('pipeline log được ghi ra file', async () => {
  const { cfg } = makeCmp();
  const p = new Pipeline(cfg);
  const r = await p.run(new ScriptedProvider(), TOPICS[0], 'draft', TOPICS);
  p.writeLog(TOPICS[0].id, r);
  assert.ok(existsSync(path.join(cfg.logDir, TOPICS[0].id + '.log')));
});
