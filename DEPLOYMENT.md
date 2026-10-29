# Triển khai website (Cloudflare Pages — miễn phí)

Website là **site tĩnh** (Astro, output `website/dist/`). Triển khai lên Cloudflare Pages:

- Free tier hiện tại: 500 build/tháng, bandwidth không giới hạn (kiểm tra lại chính sách tại
  https://www.cloudflare.com/pages/ trước khi dùng — chưa xác minh thay đổi mới).
- Không cần backend, không phát sinh hoá đơn, không cần thẻ.

## Lần triển khai đầu tiên (làm 1 lần, cần bạn đăng nhập)

Agent không thể đăng nhập Cloudflare thay bạn (thao tác xác thực của con người). Quy trình:

1. Tạo/đăng nhập [pages.cloudflare.com](https://pages.cloudflare.com) (mục Pages, không phải Workers).
2. Chọn **Create project → Connect to Git** (nếu có repo GitHub) hoặc **Direct Upload**:
   - Direct Upload (nhanh nhất cho giai đoạn này): upload thư mục `website/dist/`.
   - Project name: `so-tay-ai` → URL: `so-tay-ai.pages.dev` (hoặc tên bạn chọn).
   - Build command: *(để trống khi Direct Upload; khi dùng Git thì `npm run build`)*
   - Root directory: `website` (khi dùng Git); output: `dist`
3. Sau khi build xong, mở `https://<tên>.pages.dev` — kiểm tra:
   - Trang chủ, `/tools/` (bộ lọc chạy được, 18 công cụ hiển thị), `/guides/` (3 bài),
   - `sitemap-index.xml`, `robots.txt` (chỉ trỏ đúng domain công khai), `guides/feed.xml`.
4. **Cập nhật lại `website/.env`** với `SITE_URL=https://<tên>.pages.dev` rồi build lại,
   vì canonical/sitemap/robots dùng biến này.

## Triển khai lại sau khi có nội dung mới

```powershell
cd website
# Sửa SITE_URL trong .env nếu cần
npm run build
# Cách 1 (nhanh): trong dashboard Pages, nút "Direct Upload" upload lại thư mục dist/
# Cách 2 (Git, sau khi có repo): git add -A; git commit -m "content: ..."; git push  → Pages tự build
```

## Kiểm tra sau deploy (bắt buộc trước khi coi là "đã công khai")

- `curl -I https://<tên>.pages.dev/` phải trả `200`.
- Kiểm tra 1 link nội bộ trong bài hướng dẫn (không 404).
- `robots.txt` trỏ đúng Sitemap (không phải localhost).

## Bật analytics (bước kế tiếp, vẫn miễn phí)

Cloudflare **Web Analytics**: trong dashboard Pages, bật "Web Analytics" (không cần thêm code,
không cookie, free). Sau đó xem được lượt truy cập thật → thay cho phần "chưa có analytics"
trong `ARCHITECTURE.md`. Ghi kết quả vào `CHANGELOG.md`.
