// Danh sách chủ đề cho pipeline. Mỗi chủ đề = 1 bài hướng dẫn tiềm năng.
// status: queued = chưa làm, done = đã có bản (đánh dấu sau khi publish).

export interface Topic {
  id: string;
  title: string;
  problem: string;
  audience: string;
  status: 'queued' | 'done';
  keywords: string[];
  sources: { title: string; url: string }[];
  addedAt: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'cach-viet-prompt',
    title: 'Cách viết prompt để AI trả lời đúng ý (công thức 3 phần cho người mới)',
    problem: 'Hỏi AI chung chung thì nhận về câu trả lời chung chung, phải hỏi lại nhiều lần mới ra kết quả dùng được.',
    audience: 'Người mới dùng AI, muốn tiết kiệm lượt dùng free tier',
    status: 'queued',
    keywords: ['cách viết prompt', 'prompt cho người mới'],
    sources: [
      { title: 'ChatGPT (thực hành tại)', url: 'https://chat.openai.com' },
      { title: 'Google Gemini (thực hành tại)', url: 'https://gemini.google.com' },
    ],
    addedAt: '2026-10-29',
  },
  {
    id: 'tot-tai-lieu-bang-notebooklm',
    title: 'Tóm tắt giáo trình/PDF dài trong 5 phút bằng NotebookLM (miễn phí)',
    problem: 'Tài liệu học dài hàng trăm trang, không có thời gian đọc hết trước khi thi/công việc.',
    audience: 'Sinh viên, người cần xử lý tài liệu văn bản dài',
    status: 'queued',
    keywords: ['notebooklm tóm tắt', 'tóm tắt pdf miễn phí'],
    sources: [{ title: 'NotebookLM', url: 'https://notebooklm.google.com' }],
    addedAt: '2026-10-29',
  },
  {
    id: 'lam-slide-bang-canva-mien-phi',
    title: 'Làm bộ slide thuyết trình trong 15 phút bằng Canva (không trả phí)',
    problem: 'Cần slide nhanh cho bài thuyết trình/hội họp nhưng không biết bắt đầu, ngại các phần mềm trả phí.',
    audience: 'Sinh viên, nhân viên văn phòng cần slide cơ bản',
    status: 'queued',
    keywords: ['canva slide miễn phí'],
    sources: [{ title: 'Canva', url: 'https://www.canva.com' }],
    addedAt: '2026-10-29',
  },
];

export function nextTopic(topics: Topic[]): Topic | undefined {
  return topics.find((t) => t.status === 'queued');
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
