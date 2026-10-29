---
title: "Chạy AI miễn phí trên chính máy tính của bạn với Ollama (hướng dẫn cho người mới)"
description: "Cài Ollama, tải model mã nguồn mở, chạy chat AI hoàn toàn offline và miễn phí — kèm khuyến nghị model theo RAM/GPU."
topic: "ai-cuc-bo"
status: "published"
aiLabel: "ai-assisted"
keywords:
  - "ollama hướng dẫn người mới"
  - "chạy ai miễn phí trên máy tính"
  - "ai offline không cần internet"
sources:
  - title: "Ollama — trang chủ"
    url: "https://ollama.com"
lastVerified: "2026-10-29"
verificationNote: "Dung lượng model và khuyến nghị RAM/GPU thay đổi theo phiên bản; kiểm tra lại tại ollama.com/library trước khi tải."
createdAt: "2026-10-29"
---

Khi nào đáng bỏ công cài: bạn muốn AI **hoàn toàn offline, riêng tư, không giới hạn lượt**, và máy đủ mạnh. Nếu máy bạn dưới 8GB RAM, hãy xem hướng dẫn dùng AI web trước (mục trước) — phần sau chỉ dành cho máy "khá".

## Ollama là gì?

Ollama là chương trình cho Windows/macOS/Linux giúp tải và chạy các model ngôn ngữ mã nguồn mở ngay trên máy bạn — nói chuyện với AI **không cần internet, không cần tài khoản, không bị giới hạn lượt**. Miễn phí, mã nguồn mở (Apache-2.0).

## Khuyến nghị model theo cấu hình (tham khảo)

| Cấu hình máy | Model gợi ý | Ghi chú |
|---|---|---|
| RAM ≥ 8GB, không GPU (chỉ CPU) | `qwen3:4b`, `llama3.2:3b` | Chạy được, tốc độ trung bình |
| RAM ≥ 16GB, không GPU | `qwen3:8b` | Chất lượng tốt hơn rõ rệt |
| Có GPU 6–8GB (RTX 3060/4060…) | `qwen3:8b` hoặc `14b` | Nhanh, dùng được hàng ngày |
| Có GPU 12GB+ | `qwen3:32b` (thử) | Cần thời gian nạp model |

> Con số ở đây là **gợi ý khởi điểm**, không phải hứa. Tốc độ thực tế phụ thuộc CPU/GPU cụ thể của bạn — hãy chạy thử 1 câu hỏi và đo.

## Cài đặt (Windows)

1. Tải file cài đặt từ [ollama.com](https://ollama.com) (Windows: `.exe`).
2. Chạy file đó. Ollama hoạt động như dịch vụ nền (biểu tượng Ollama xuất hiện trên khay hệ thống, port `11434`).
3. Kiểm tra trong terminal (PowerShell):
   ```powershell
   ollama list
   ```

## Tải model và bắt đầu

```powershell
# Tải model Qwen3 4B (khoảng 2,5–3GB, cân nhắc dung lượng ổ)
ollama pull qwen3:4b

# Chạy chat ngay trong terminal
ollama run qwen3:4b

# Hoặc gọi bằng HTTP (cho các script/ứng dụng khác)
# POST http://localhost:11434/api/chat
```

Mở thêm một cửa sổ terminal khác, thử:

```powershell
curl http://localhost:11434/api/generate -d '{"model":"qwen3:4b","prompt":"Giải thích cho tôi, tôi không biết gì về code, là gì: biến số trong chương trình?"}'
```

## Kết nối với ứng dụng (nếu bạn biết lập trình)

Ollama có endpoint tương thích OpenAI: `http://localhost:11434/v1`. Các thư viện/ứng dụng dùng được OpenAI API đều chỉ cần đổi base URL và để API key bất kỳ (Ollama không kiểm tra key).

## Giới hạn bạn cần biết (không bịa — đây là thật)

- **Tốc độ**: CPU-only sẽ chậm (vài từ/giây) với model ≥ 8B. GPU bắt buộc cho trải nghiệm "suôn".
- **Chất lượng**: model nhỏ (4B–8B) trả lời ngắn gọn, hay "quên" thông tin cũ; không phải thay thế model lớn.
- **Dung lượng**: mỗi model 2.5–30GB; xóa bằng `ollama rm <tên>`.
- **Model thay đổi**: tên/phiên bản model trong thư viện cập nhật thường xuyên; kiểm tra [ollama.com/library](https://ollama.com/library) trước khi tải.

## Khi nào DỪNG lại?

Nếu bạn chỉ cần hỏi đáp đơn giản và không quan tâm riêng tư, các **dịch vụ web ở mục trước đã đủ và nhanh hơn** — không cần cài. Chạy local đáng khi bạn: (1) không muốn dữ liệu lên mạng, (2) muốn dùng không giới hạn, (3) thích "vọc" kỹ thuật.
