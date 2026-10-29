# Triển khai website (miễn phí)

Website là **site tĩnh** (Astro, output `website/dist/`). Có 2 con đường free, chọn 1:

## Cách 1 — GitHub Pages (nhanh nhất, ~2 phút, chỉ 1 lần bấm)

Repo: `github.com/legiaptuanson1234-collab/main` (public, 0đ).

1. Vào repo trên GitHub → tab **Settings** → mục **Pages** (cột bên trái).
2. Mục "Build and deployment" → **Source**: chọn **GitHub Actions**.
3. Chờ 1–3 phút. Workflow `.github/workflows/deploy-pages.yml` tự:
   - `npm ci` + `npm run build` với `SITE_URL=https://legiaptuanson1234-collab.github.io/main/`
   (sitemap/robots/canonical tự trỏ đúng URL công khai),
   - publish `website/dist/`.
4. URL công khai: `https://legiaptuanson1234-collab.github.io/main/`
   - Kiểm tra: mở URL đó, click `/tools/` (filter chạy), `/guides/`, mở `sitemap-index.xml`, `robots.txt`.
   - Từ đó trở đi, mỗi lần `git push` vào `main` (kể cả khi pipeline publish nội dung mới)
     website **tự build + deploy lại** — không cần thao tác gì thêm.

Lưu ý: tên thư mục site của Pages theo tên repo (`/main/`). Nếu sau này đổi tên repo,
đổi lại hằng `SITE_URL` trong `deploy-pages.yml` và config Pages cho khớp.

## Cách 2 — Cloudflare Pages (giữ làm dự phòng, cần 5 bước bấm)

1. Dashboard Pages → **Create project → Connect to Git** (GitHub) → chọn repo `main`.
   (Nếu chưa connect GitHub với Cloudflare: "Connect GitHub" rồi authorize app.)
2. Build command: `npm run build` · Root: `website` · Output: `dist`.
3. Environment variable (Public, chỉ dùng cho build): `SITE_URL=https://<ten>.pages.dev`
   (URL thực được hệ thống gán sau lần build đầu — build lần đầu có thể còn `localhost`,
   điền `SITE_URL` rồi "Build" lại 1 lần nữa).
4. Kiểm tra: `/tools/`, `/guides/`, `sitemap-index.xml`, `robots.txt` trỏ đúng domain.
5. Bật **Web Analytics** (trên chính project) để đo traffic thật — free, không code.

## Vì sao KHÔNG dùng GitHub Actions để gọi Ollama

Ollama chạy cục bộ trên máy bạn. GitHub Actions (cloud) không với tới được nó
trừ khi mở port Ollama ra Internet — **chúng ta không làm việc đó** (SECURITY.md).
Tự động hoá nội dung do **Task Scheduler trên máy** đảm nhiệm (AUTOMATION.md);
Actions chỉ lo build/deploy website khi có commit mới.

## Trạng thái hiện tại

- [x] Push repo lên GitHub: 3 commits (mới nhất `ea18b77`), xác minh qua API.
- [ ] Bật Pages (chọn Cách 1 hoặc 2 ở trên) — **chờ bạn bấm 1–5 bước**.
- [ ] Xác minh URL công khai (sau khi Pages build xong) rồi ghi lại vào CHANGELOG.
- [ ] Analytics: bật Web Analytics (Cloudflare) hoặc đếm view Pages — ghi kết quả thật vào CHANGELOG.
