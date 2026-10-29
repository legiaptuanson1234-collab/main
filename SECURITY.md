# Bảo mật & giới hạn quyền

## Nguyên tắc đã thực thi trong mã nguồn

- **Không có secret trong repo**: toàn bộ cấu hình pipeline chỉ dùng biến môi trường không bí mật
  (URL Ollama local, tên model). Không có API key nào vì Ollama chạy cục bộ.
- `.gitignore` chặn `.env`, `pipeline/.lock`, log, `node_modules`, `dist`.
- **Ollama chỉ lắng nghe 127.0.0.1:11434** (mặc định). Không mở port ra Internet —
  nếu ai đó mở Ollama cho LAN/Internet, model có thể bị dùng để chạy mã độc hoặc
  thực thi lệnh; vì vậy đây là ranh giới bảo mật, không được "giải quyết vấn đề" bằng cách mở port.
- Pipeline **không** chèn mã từ nội dung web vào shell. Nội dung AI chỉ được đọc/ghi dưới dạng
  file markdown trong thư mục con (không chạy eval nội dung).
- Bản nháp và bài publish có `status: "draft"` trong frontmatter cho tới khi con người duyệt
  và build website (bài "publish" của pipeline chỉ là đưa vào thư mục nội dung, chưa phải
  công bố trên web).

## Các thao tác bị cấm tự động (theo thiết kế)

| Thao tác | Ai làm | Vì sao |
|---|---|---|
| Đăng nhập Cloudflare / GitHub | Con người (bạn) | Xác thực là thao tác con người |
| `git push` lần đầu (tạo remote) | Con người cấp quyền, sau đó agent chạy được | Không tự đăng ký tài khoản |
| Bật chế độ `publish` lên lịch | Con người quyết định | Xuất bản công khai = hệ quả không thể đảo ngược dễ |
| Xóa repo / dữ liệu / đổi quyền tài khoản | Không bao giờ tự động | Nguy hiểm, không cần thiết cho MVP |

## Khi dùng Git (giai đoạn sau)

- Remote GitHub: **public hoặc private đều 0đ** (tài khoản free, private ≤3 người).
- Chỉ push mã nguồn + nội dung. Không bao giờ commit `.env` thật, token, hoặc `pipeline/.lock`.
- Trước khi commit quan trọng: `git status` và `git diff` (nạp trong README hướng dẫn khôi phục).

## Rủi ro đã biết, chưa xử lý (tính trung thực)

- Website chưa có rate limit cho form (chưa có form → chưa có rủi ro này; khi thêm form,
  phải thêm CAPTCHA miễn phí như Cloudflare Turnstile trước).
- `tools.json` do con người/agent bảo trì: một tool có thể bị đổi chính sách miễn phí mà
  pipeline chưa cập nhật → mỗi mục có `lastChecked`; Task Scheduler nên chạy
  "kiểm tra lại danh bạ" định kỳ (chưa tự động hoá, ghi rõ đây là TODO).
