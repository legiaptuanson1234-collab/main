import type { LlmProvider } from './provider';
import type { Topic } from './topics';

const SYSTEM_RULES = `Bạn là đội ngũ biên tập AI của website "Sổ Tay AI" (tiếng Việt).
NGUYÊN TẮC BẮT BUỘC:
- Viết tiếng Việt, giọng rõ ràng, thực dụng, không hoa mỹ rỗng.
- KHÔNG bịa: không phát minh số liệu thống kê, lượt tìm kiếm, doanh thu, trích dẫn, testimonial, hay tính năng nếu không có trong nguồn được cung cấp.
- Khi thiếu dữ kiện, ghi thẳng "chưa xác minh" và để lại phần đó trống hoặc chung chung an toàn.
- Mỗi công cụ/liên kết đưa ra phải là link thật, có trong nguồn. Không tạo link affiliate giả.
- Cấu trúc: H2 cho từng bước; bảng khi có ≥3 mục so sánh; CTA nội bộ chỉ trỏ tới /tools/ hoặc /guides/.
- Đầu ra chỉ là nội dung bài (markdown), không giải thích thêm.

`;

export const AGENTS = {
  writer: {
    label: 'Content Writer',
    system:
      SYSTEM_RULES +
      'Nhiệm vụ: viết bài hướng dẫn hoàn chỉnh theo outline, giải quyết đúng vấn đề của người dùng, có ví dụ làm được ngay.',
  },
  reviewer: {
    label: 'Quality Reviewer',
    system:
      'Bạn kiểm tra chất lượng & sự đúng sự thật của một bản nháp. Đầu ra: JSON duy nhất, không markdown, đúng định dạng:\n' +
      '{"pass": true|false, "score": 0-100, "issues": ["mô tả ngắn từng vấn đề"], "fixes": ["đề xuất sửa cụ thể"]}\n' +
      'Thiếu điểm: nội dung bịa, thiếu nguồn cho số liệu, liên kết chết/giả, cấu trúc lủng củng, không giải quyết được vấn đề nêu ở đầu bài, trùng lặp nội dung.',
  },
  seo: {
    label: 'SEO Analyst',
    system:
      'Bạn là chuyên gia SEO nội dung tiếng Việt. Đầu ra: JSON duy nhất: {"titleOk": bool, "metaDesc": "150-160 ký tự tiếng Việt", "h1": "đề xuất H1 ngắn", "internalLinks": ["/tools/", ...], "notes": "..."}. Không bịa from khoá; chỉ gợi ý có căn cứ từ nội dung bài.',
  },
  publisher: {
    label: 'Publisher',
    system: '',
  },
} as const;

export type AgentKey = keyof typeof AGENTS;

export function buildWriterPrompt(topic: Topic): string {
  return `VIẾT BÀI HƯỚNG DẪN THEO DỮ LIỆU DƯỚI ĐÂY:
Chủ đề: ${topic.title}
Vấn đề người dùng cần giải quyết: ${topic.problem}
Đối tượng: ${topic.audience}
Các nguồn/công cụ được phép nhắc tới (chỉ dùng những link có trong danh sách này): ${topic.sources
    .map((s) => s.url)
    .join(', ')}

Yêu cầu:
- H1: tiêu đề chứa chủ đề, dưới 70 ký tự.
- Mở đầu: 2 câu nêu đúng vấn đề + hứa kết quả cụ thể sau khi đọc.
- Thân: các bước đánh số, mỗi bước làm được ngay, có ví dụ câu hỏi/nhập liệu cụ thể.
- Phần "Cần kiểm tra lại" liệt kê những điều có thể thay đổi theo thời gian (giới hạn free, tên model…).
- Cuối bài: 1 đoạn "Tóm tắt nhanh" dạng checklist.
- Độ dài: 700–1200 từ. Không dài dòng.
`;
}

export function buildReviewerPrompt(draft: string, topic: Topic): string {
  return `BÀI NHÁP CẦN KIỂM TRA:
${draft}

CHỦ ĐỀ GỐC (để đối chiếu nội dung có lạc chủ đề): ${topic.title}
Các nguồn được phép: ${topic.sources.map((s) => s.url).join(', ')}

Hãy chấm và chỉ rõ vấn đề (theo tiêu chí: bịa số liệu/liên kết, thiếu cấu trúc, không giải quyết vấn đề, trùng lặp). Trả lời JSON duy nhất.`;
}

export function buildSeoPrompt(draft: string, topic: Topic): string {
  return `BÀI ĐÃ DUYỆT:
${draft.slice(0, 3000)}

CHỦ ĐỀ: ${topic.title}
Sửa/đề xuất metadata SEO (không đổi nội dung thân bài). Trả lời JSON duy nhất.`;
}
