# Kiến trúc & luồng dữ liệu

## Sơ đồ tổng quan

```
                ┌──────────────────────────────────────────────┐
                │  MÁY CÁ NHÂN (Windows, 0đ/tháng)            │
                │                                              │
  topics.ts ──► │  pipeline/src/cli.ts                        │
                │    │  (modes: draft / review / publish /    │
                │    │            dry-run, lockfile, log)     │
                │    ▼                                        │
                │  Pipeline.run()                             │
                │    ├─ Agent Writer   ──► Ollama (qwen2.5:7b│
                │    │   (prompt hệ thống + rules "không bịa")│  @127.0.0.1:11434
                │    ├─ Agent Reviewer ─► JSON {pass,score}   │
                │    ├─ checkDuplication (so bài cũ trong     │
                │    │   website/src/content/guides)          │
                │    ├─ checkInternalLinks (link /... trong   │
                │    │   bài vs trang tồn tại)                │
                │    └─ Agent SEO ────► metadata (metaDesc…)  │
                │    │                                        │
                │    ▼                                        │
  pipeline/drafts/*.md  (draft, luôn được ghi trong an toàn)  │
                │    │                                        │
                │    ▼ (chỉ khi mode=publish VÀ reviewer pass) │
  website/src/content/guides/<slug>.md                        │
                │                                              │
                ▼                                              │
  website/ (Astro static) ── build ─► dist/ ──► Cloudflare    │
  (Astro, Node)           (npm run    Pages (hosting free,    │
                              build)    con người thao tác)    │
                └──────────────────────────────────────────────┘
```

## Luồng dữ liệu từng lần chạy pipeline

1. `cli.ts` đọc `--topic` (hoặc chủ đề queued đầu tiên trong `topics.ts`).
2. `OllamaProvider.isAvailable()` ping `GET /api/tags` — nếu không có server/model → **dừng, exit code 4** (không bịa kết quả).
3. **Writer** nhận prompt hệ thống (luật "không bịa số liệu/liên kết/testimonial, chỉ dùng nguồn trong chủ đề") + dữ liệu chủ đề → bản nháp markdown (1–3 phút, GPU).
4. Chế độ `draft`: dừng tại đây, lưu `pipeline/drafts/<slug>.md`.
5. **Reviewer** (bắt buộc trong `review`/`publish`/`dry-run`): chấm JSON `{pass, score, issues}`.
6. **Checks cứng (không dùng AI)**: trùng lặp nội bộ, link nội bộ, slug trùng.
7. Ngưỡng publish: `pass === true && score >= 60 && không có link lạ`. Không đạt → **dừng, chỉ giữ nháp** (chế độ an toàn).
8. **SEO agent** (chỉ khi đủ điều kiện): metadata.
9. Ghi frontmatter + thân bài vào `website/src/content/guides/<slug>.md`.

**Không có gì sau bước 9 trong pipeline.** Build website, commit, push, deploy là thao tác của con người (có chủ đích, xem `DEPLOYMENT.md`).

## Lý do chọn kiến trúc này (thay vì Ever Works)

- Máy không có Docker; monorepo pnpm của Ever Works nặng và cần GitHub OAuth App → vượt xa mức "MVP an toàn, dễ bảo trì".
- Một website nội dung ngách chỉ cần: site tĩnh + pipeline văn bản. 2 component, tất cả chạy local, không cloud resource phát sinh hoá đơn.
- Model cục bộ (Ollama) → chi phí AI = 0đ, không API trả phí; giới hạn là tốc độ (chấp nhận được cho 1–3 bài/tuần).

## Các giới hạn đã biết (ghi thẳng, không che)

| Giới hạn | Hệ quả | Cách xử lý |
|---|---|---|
| Qwen2.5:7B (Q4) ~4.7GB | CPU-only thì chậm (phút/bài); GPU (RTX 4060) ~10s–1p | Task Scheduler chạy lúc rảnh; giữ máy bật |
| Pipeline chỉ chạy khi Ollama serve | `exit 4` | Script khởi động Ollama trước pipeline (xem AUTOMATION.md) |
| Không có analytics thật ở MVP | Chưa đo được lượt truy cập | Bước kế tiếp: Cloudflare Web Analytics (free, không code) — ghi trong CHANGELOG |
| GitHub Actions không gọi được Ollama cục bộ (không mở port ra Internet — không làm) | Tự động hoá phải chạy trên máy | Task Scheduler là đáp án đúng cho máy Windows |
