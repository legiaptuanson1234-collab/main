# CHANGELOG

## 2026-10-29 — Khởi tạo hệ thống

### Website (Sổ Tay AI)
- [x] Astro 7 static site: trang chủ, danh bạ 18 công cụ (filter client-side), 3 hướng dẫn mẫu (đã kiểm tra, có nguồn + ngày xác minh), about/contact/privacy/terms/affiliates/404, RSS, sitemap, robots.txt, favicon, Open Graph, canonical.
- [x] Build production pass (12 trang), script verify kiểm tra nội dung output.
- [ ] Chưa có: analytics (bước kế tiếp: Cloudflare Web Analytics free, ghi trong DEPLOYMENT.md).

### Pipeline nội dung AI
- [x] Ollama v0.40.13 portable (không cần admin) tại `tools/ollama/`, model `qwen2.5:7b` (4.7GB) + giữ `qwen3:4b` (2.5GB).
- [x] Provider layer (Ollama/Mock), 4 agent theo prompt (writer/reviewer/seo/publisher), checks: slug trùng, trùng lặp nội bộ, link nội bộ, ngưỡng an toàn (reviewer pass + score≥60).
- [x] 4 chế độ: `draft` (mặc định), `review`, `publish`, `dry-run`; lockfile chống chạy chồng; log per-topic.
- [x] Test suite `node:test` 9/9 pass (mock provider, không cần Ollama).
- [x] Bản nháp mẫu tạo thật bằng model: `pipeline/drafts/cach-viet-prompt-...md`.

### Kiến trúc đã loại bỏ (kèm lý do)
- [x] Ever Works: KHÔNG dùng — máy không có Docker; monorepo pnpm + GitHub OAuth App vượt mức cần thiết. (Chi tiết: BUSINESS_PLAN.md, ARCHITECTURE.md.)
- [x] Qwen3:4b làm writer mặc định: loại — model thinking leak "thought chain" vào nội dung; dùng Qwen2.5:7b thay thế (đã test thực tế).

### Chưa làm (trần thuật trung thực)
- [ ] `git push` lên GitHub remote — CHƯA (cần bạn cấp quyền tài khoản; lệnh có sẵn, xem README).
- [ ] Deploy Cloudflare Pages — CHƯA (cần bạn đăng nhập; cấu hình + kiểm tra đã ghi sẵn trong DEPLOYMENT.md).
- [ ] Affiliate: CHƯA có chương trình nào (trang /affiliates/ công khai trạng thái này).
