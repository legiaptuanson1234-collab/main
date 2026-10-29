import {
  mkdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import path from 'node:path';
import type { LlmProvider } from './provider.ts';
import { AGENTS, buildWriterPrompt, buildReviewerPrompt, buildSeoPrompt } from './agents.ts';
import { slugify, type Topic } from './topics.ts';

export type Mode = 'draft' | 'review' | 'publish' | 'dry-run';

export interface PipelineCfg {
  contentDir: string;
  publishDir: string;
  logDir: string;
  websiteRoot: string;
}

export interface RunResult {
  topicId: string;
  slug: string;
  mode: Mode;
  passed: boolean;
  score: number;
  draftPath?: string;
  publishedPath?: string;
  error?: string;
  log: string[];
}

interface Review {
  pass: boolean;
  score: number;
  issues: string[];
  fixes: string[];
}

function parseReview(raw: string): Review | null {
  try {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const i = cleaned.indexOf('{');
    const j = cleaned.lastIndexOf('}');
    if (i < 0 || j < 0) return null;
    const obj = JSON.parse(cleaned.slice(i, j + 1));
    if (typeof obj.score !== 'number') obj.score = 0;
    obj.issues = Array.isArray(obj.issues) ? obj.issues : [];
    obj.fixes = Array.isArray(obj.fixes) ? obj.fixes : [];
    obj.pass = Boolean(obj.pass);
    return obj as Review;
  } catch {
    return null;
  }
}

async function callAgent(
  provider: LlmProvider,
  role: 'writer' | 'reviewer' | 'seo',
  userPrompt: string
): Promise<string> {
  const sys = AGENTS[role].system;
  return provider.generate(`${sys}\n\n${userPrompt}`, {
    maxTokens: role === 'writer' ? 2500 : 600,
  });
}

export class Pipeline {
  private cfg: PipelineCfg;
  private logLines: string[] = [];

  constructor(cfg: PipelineCfg) {
    this.cfg = cfg;
    for (const d of [cfg.contentDir, cfg.publishDir, cfg.logDir]) {
      mkdirSync(d, { recursive: true });
    }
  }

  private log(msg: string) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    this.logLines.push(line);
    console.log(line);
  }

  isSlugTaken(slug: string, topics: Topic[], current: Topic): boolean {
    return topics.some((t) => t.id !== current.id && slugify(t.title) === slug);
  }

  /** Trùng lặp nội bộ: nếu >50% các câu dài của bản nháp đã có trong một bài cũ. */
  async checkDuplication(draft: string, slug: string): Promise<{ dup: boolean; against?: string }> {
    if (!existsSync(this.cfg.publishDir)) return { dup: false };
    const files = readdirSync(this.cfg.publishDir).filter((f) => f.endsWith('.md') && !f.includes(slug));
    const draftNorm = draft.toLowerCase().replace(/\s+/g, ' ');
    const sentences = draftNorm.match(/[^.!?]+[.!?]/g) ?? [];
    for (const f of files) {
      const other = readFileSync(path.join(this.cfg.publishDir, f), 'utf8')
        .toLowerCase()
        .replace(/\s+/g, ' ');
      const hits = sentences.filter((s) => s.length > 40 && other.includes(s.trim().slice(0, 40)));
      if (sentences.length > 3 && hits.length / sentences.length > 0.5) {
        return { dup: true, against: f };
      }
    }
    return { dup: false };
  }

  /** Link nội bộ: ( /... ) phải trỏ tới đường dẫn quen thuộc. Không có căn cứ -> cảnh báo. */
  checkInternalLinks(draft: string): string[] {
    const known = new Set(['/tools/', '/guides/', '/about/', '/contact/', '/privacy/', '/terms/', '/affiliates/']);
    const problems: string[] = [];
    const matches = draft.match(/\((\/[a-z0-9-]+\/?)\)/gi) ?? [];
    for (const m of matches) {
      const p = m.match(/\((\/[^)]+)\)/)?.[1];
      if (p && !known.has(p)) problems.push(`Link nội bộ chưa rõ: ${p}`);
    }
    return problems;
  }

  buildFrontmatter(topic: Topic, seoMeta: { metaDesc?: string }): string {
    const today = new Date().toISOString().slice(0, 10);
    return [
      '---',
      `title: ${JSON.stringify(topic.title)}`,
      `description: ${JSON.stringify(seoMeta.metaDesc ?? topic.problem)}`,
      `topic: ${JSON.stringify(topic.id)}`,
      `status: "draft"`,
      `aiLabel: "ai-assisted"`,
      `keywords: ${JSON.stringify(topic.keywords)}`,
      `lastVerified: ${JSON.stringify(today)}`,
      `verificationNote: ${JSON.stringify('Nội dung do AI tạo — người biên tập cần rà soát nguồn và giới hạn miễn phí trước khi xuất bản.')}`,
      `createdAt: ${JSON.stringify(today)}`,
      '---',
      '',
    ].join('\n');
  }

  async run(provider: LlmProvider, topic: Topic, mode: Mode, allTopics: Topic[]): Promise<RunResult> {
    this.logLines = [];
    const log = this.logLines;
    const result: RunResult = { topicId: topic.id, slug: slugify(topic.title), mode, passed: false, score: 0, log };
    this.log(`Bắt đầu pipeline "${topic.id}" (mode=${mode}, provider=${provider.name})`);

    try {
      if (mode !== 'dry-run' && this.isSlugTaken(result.slug, allTopics, topic)) {
        result.error = 'Slug trùng với chủ đề khác — đổi title rồi chạy lại.';
        this.log('LỖI: slug trùng.');
        return result;
      }

      this.log('Writer: sinh bản nháp…');
      const draft = await callAgent(provider, 'writer', buildWriterPrompt(topic));
      if (!draft || draft.length < 300) {
        result.error = 'Bản nháp quá ngắn/rỗng từ model — dừng (chế độ an toàn).';
        this.log('LỖI: nháp không đạt tối thiểu.');
        if (mode !== 'dry-run') result.draftPath = this.saveDraft(topic, result.slug, draft);
        return result;
      }

      if (mode === 'draft') {
        this.log('Chế độ draft: chỉ lưu nháp.');
        if (mode !== 'dry-run') result.draftPath = this.saveDraft(topic, result.slug, draft);
        result.passed = true;
        return result;
      }

      this.log('Reviewer: kiểm tra chất lượng…');
      const reviewRaw = await callAgent(provider, 'reviewer', buildReviewerPrompt(draft, topic));
      const review = parseReview(reviewRaw);
      if (!review) {
        result.error = 'Reviewer trả về JSON không hợp lệ — giữ nháp để xem thủ công.';
        this.log('LỖI: parse review thất bại.');
        if (mode !== 'dry-run') result.draftPath = this.saveDraft(topic, result.slug, draft);
        return result;
      }
      result.score = review.score;
      this.log(`Reviewer: pass=${review.pass} score=${review.score} issues=${review.issues.length}`);

      const dup = await this.checkDuplication(draft, result.slug);
      if (dup.dup) {
        result.error = `Nội dung trùng với ${dup.against} — đổi góc tiếp cận rồi chạy lại.`;
        this.log('LỖI: trùng lặp nội bộ.');
        if (mode !== 'dry-run') result.draftPath = this.saveDraft(topic, result.slug, draft);
        return result;
      }
      const linkProblems = this.checkInternalLinks(draft);
      if (linkProblems.length) this.log('Cảnh báo link nội bộ: ' + linkProblems.join(' | '));

      const publishable = review.pass && review.score >= 60 && linkProblems.length === 0;

      if (mode === 'review') {
        this.log('Chế độ review: lưu nháp + báo cáo, chưa xuất bản.');
        result.passed = publishable;
        if (mode !== 'dry-run') result.draftPath = this.saveDraft(topic, result.slug, draft);
        return result;
      }

      if (mode === 'publish') {
        if (!publishable) {
          result.error = `Không đủ điều kiện xuất bản (pass=${review.pass}, score=${review.score}, links=${linkProblems.length}). NHÁP ĐÃ LƯU, KHÔNG XUẤT BẢN.`;
          this.log('DỪNG: không publish (ngưỡng an toàn).');
          result.draftPath = this.saveDraft(topic, result.slug, draft);
          return result;
        }
        this.log('SEO: metadata…');
        const seoRaw = await callAgent(provider, 'seo', buildSeoPrompt(draft, topic));
        let seoMeta: { metaDesc?: string } = {};
        try {
          const c = seoRaw.replace(/```json/g, '').replace(/```/g, '').trim();
          seoMeta = JSON.parse(c.slice(c.indexOf('{'), c.lastIndexOf('}') + 1));
        } catch {
          this.log('SEO JSON không hợp lệ — dùng description gốc.');
        }
        const fm = this.buildFrontmatter(topic, seoMeta);
        const finalMd = fm + '\n' + draft.replace(/^#\s.*\n/, '');
        const pubPath = path.join(this.cfg.publishDir, `${result.slug}.md`);
        writeFileSync(pubPath, finalMd, 'utf8');
        result.publishedPath = pubPath;
        result.passed = true;
        this.log(`ĐÃ XUẤT BẢN: ${pubPath}`);
        return result;
      }

      this.log('Chế độ dry-run: mô phỏng, KHÔNG ghi file / KHÔNG publish.');
      result.passed = publishable;
      return result;
    } catch (e) {
      result.error = e instanceof Error ? e.message : String(e);
      this.log('LỖI: ' + result.error);
      return result;
    }
  }

  private saveDraft(topic: Topic, slug: string, draft: string): string {
    const p = path.join(this.cfg.contentDir, `${slug}.md`);
    const fm = this.buildFrontmatter(topic, {});
    writeFileSync(p, fm + '\n' + draft, 'utf8');
    this.log('Đã lưu nháp: ' + p);
    return p;
  }

  writeLog(topicId: string, result: RunResult): void {
    writeFileSync(path.join(this.cfg.logDir, `${topicId}.log`), result.log.join('\n') + '\n', 'utf8');
  }
}
