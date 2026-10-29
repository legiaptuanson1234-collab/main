# CHANGELOG

## 2026-10-29 (đêm 2) — Kiến trúc kiếm tiền (0đ, không bịa doanh thu)

- [x] **Sản phẩm số gốc**: "Prompt &amp; Template Kit" (6 file tiếng Việt: công thức 3 phần, 30 mẫu prompt học tập + công việc, checklist chọn công cụ miễn phí, hướng dẫn 10 phút) — nội dung biên tập gốc, có quyền phân phối.
- [x] Nút tải **hoạt động thật**: prebuild đóng gói `public/downloads/prompt-kit.zip` (jszip, build fail nếu thiếu file) + trang `/product/` (CTA trên trang chủ + menu điều hướng).
- [x] **Affiliate-ready (không bịa)**: `tools.json` thêm 2 trường tuỳ chọn `affiliateUrl`/`affiliateProgram`; khi điền, trang /tools/ tự gắn nhãn "liên kết đối tác" + disclosure; khi chưa có = link thường. Trang /affiliates/ ghi rõ quy trình 5 bước bật affiliate thật.
- [x] PREMIUM SLOT: `product.json` (premium.enabled=false) — chỉ cần bạn đặt 1 link Gumroad/Stripe + giá là nút "Mua bản nâng cao" hiện. Không có checkout giả.
- [ ] Chưa có: doanh thu (chưa có traffic/chưa có chương trình affiliate) — mọi số "doanh thu" vẫn đánh dấu chưa xác minh.

## 2026-10-29 (đêm) — Deploy công khai + sửa hệ thống subpath

- [x] Push repo lên GitHub: `github.com/legiaptuanson1234-collab/main` (5 commits, xác minh qua API).
- [x] Bật GitHub Pages (Source: GitHub Actions) → **URL công khai hoạt động: https://legiaptuanson1234-collab.github.io/main/**
- [x] Sửa lỗi subpath (site chạy ở `/main/`, không phải gốc domain): thêm `BASE_PATH` cho Astro, helper `href()` cho mọi link nội bộ, sửa robots/sitemap/RSS/favicon → build + test thật (không có double-prefix `/main/main/`).
- [x] Workflow `deploy-pages.yml`: tự build + publish mỗi lần push (mặc định dùng BASE_PATH theo tên repo; đổi tên repo là vẫn hoạt động).
- [x] CI xanh: sửa typo tên file test trong workflow + mock provider trả JSON theo vai trò (dry-run/draft mock exit 0).
- [x] Kiểm chứng công khai: **9/9** (trang chủ, /tools/ filter+data, /guides/, bài hướng dẫn UTF-8, sitemap-index, sitemap đúng domain, robots, RSS, 404) — script `tools/verify-public.mjs`.
- [ ] Analytics: chưa bật (Cloudflare Web Analytics cần Cloudflare; hoặc dùng GitHub Pages web analytics — ghi nhận khi có).

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
