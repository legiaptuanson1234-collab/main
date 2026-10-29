# Sổ Tay AI — hệ thống website + pipeline nội dung AI cục bộ (0đ/tháng)

Hệ thống gồm 2 phần chạy hoàn toàn trên máy bạn, không tốn phí phần mềm định kỳ:

| Thành phần | Công nghệ | Vị trí |
|---|---|---|
| Website (site tĩnh) | Astro 7 + TypeScript | `website/` |
| Pipeline nội dung AI | Ollama (model `qwen2.5:7b`) + Node 24 | `pipeline/` |
| Mô hình kinh doanh | Tham khảo | `BUSINESS_PLAN.md` |
| Kiến trúc & luồng dữ liệu | Tham khảo | `ARCHITECTURE.md` |

## Yêu cầu

- Windows 10/11 (thiết kế cho máy Windows; script Task Scheduler là của Windows)
- Node.js ≥ 22 (máy này dùng Node 24)
- Ollama (bản portable, đã đặt sẵn ở `tools/ollama/`) + model `qwen2.5:7b`
- Git
- RAM ≥ 16GB khuyến nghị (model 7B ~4.7GB; RTX 4060 Laptop 8GB chạy tốt; chỉ CPU thì chậm)

## Khởi động nhanh

```powershell
# 1) Web server Ollama (chỉ cần chạy 1 lần, giữ trong nền)
Start-Process E:\KIEMTIEN\tools\ollama\ollama.exe -ArgumentList "serve" -WindowStyle Hidden

# 2) Chạy website dev (http://localhost:4321)
cd website
npm install
npm run dev

# 3) Sinh bản nháp nội dung (chế độ draft — MẶC ĐỊNH, an toàn)
cd ..
node pipeline/src/cli.ts --list-topics
node pipeline/src/cli.ts --topic cach-viet-prompt --mode draft
```

Bản nháp nằm ở `pipeline/drafts/`. Các chế độ khác:

```powershell
node pipeline/src/cli.ts --topic <id> --mode dry-run   # mô phỏng, không ghi gì
node pipeline/src/cli.ts --topic <id> --mode review    # sinh + kiểm tra, chờ duyệt
node pipeline/src/cli.ts --topic <id> --mode publish   # CHỈ khi nháp đạt ngưỡng (reviewer pass & score≥60)
node pipeline/src/cli.ts --topic <id> --mode draft --mock  # kiểm thử không cần Ollama
```

## Kiểm tra & build

```powershell
cd website
npm run build        # build production -> dist/
node scripts/verify.mjs
node scripts/check-tools.mjs

cd ..
node --test pipeline/test/   # test suite pipeline
```

## Biến môi trường (pipeline)

Không có secret. Chỉ có cấu hình (xem `pipeline/.env.example` nếu dùng `.env`).

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Địa chỉ Ollama |
| `OLLAMA_MODEL` | `qwen2.5:7b` | Model |
| `OLLAMA_TIMEOUT_MS` | `600000` | Timeout sinh nội dung |
| `PIPELINE_MODE` | `draft` | Chế độ mặc định khi không truyền `--mode` |

## Website — build & deploy

```powershell
cd website
echo SITE_URL=https://so-tay-ai.pages.dev > .env   # sửa đúng URL khi đã deploy
npm run build
# dist/ là thư mục upload lên Cloudflare Pages
```

Xem `DEPLOYMENT.md` (Cloudflare Pages) và `AUTOMATION.md` (Task Scheduler) cho quy trình đầy đủ.

## Khôi phục khi lỗi

- **Ollama không chạy**: `Start-Process E:\KIEMTIEN\tools\ollama\ollama.exe -ArgumentList "serve" -WindowStyle Hidden`, kiểm tra `http://127.0.0.1:11434/api/tags` phải có `qwen2.5:7b`.
- **Model chưa tải**: `E:\KIEMTIEN\tools\ollama\ollama.exe pull qwen2.5:7b`
- **Build website lỗi**: `cd website; rm -rf node_modules; npm install; npm run build`
- **Pipeline chặn bởi lockfile cũ (máy crash khi đang chạy)**: xoá `pipeline/.lock`

## Lệnh tắt (Windows Task Scheduler)

Script bật/tắt tự động hoá: `automation/enable-task.ps1` / `automation/disable-task.ps1` — xem `AUTOMATION.md`.

## An toàn (đọc trước khi dùng chế độ publish)

- Mặc định **draft**: AI không tự công bố gì. Chỉ khi chạy `--mode publish` và bản nháp vượt qua reviewer (JSON: pass=true, score≥60) pipeline mới ghi bài vào `website/src/content/guides/`.
- Pipeline KHÔNG tự build, KHÔNG tự push Git, KHÔNG tự deploy. Đó là bước của con người (chạy `npm run build` + review + `git commit/push`), tránh hậu quả không thể đảo ngược từ máy cục bộ.
- Không bao giờ commit `.env`, key, token (xem `SECURITY.md` và `.gitignore`).
