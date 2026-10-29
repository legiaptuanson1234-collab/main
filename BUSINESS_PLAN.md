# KẾ HOẠCH KINH DOANH — Sổ Tay AI

> Trạng thái: **ĐÃ QUYẾT ĐỊNH** (2026-10-29) · Ngân sách: 0đ tiền mặt
> Lưu ý: đây là kế hoạch kèm giả định, **chưa phải doanh thu thực**. Mọi số liệu không xác minh được đều được đánh dấu `[chưa xác minh]`.

## 1. Phương pháp chấm điểm

Thang 100 điểm theo prompt: Nhu cầu (20), Sản phẩm hữu ích (20), Khác biệt (15), Tiếp cận miễn phí (15), Doanh thu (15), Ngân sách 0đ (10), Rủi ro (5 — điểm cao = rủi ro thấp).

## 2. Bảng chấm điểm 9 ý tưởng (ngân sách 0đ)

| # | Ý tưởng | Nhu cầu | Sản phẩm | Khác biệt | Tiếp cận | Doanh thu | 0đ | Rủi ro | **Tổng** |
|---|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Website hướng dẫn + danh bạ "dùng AI miễn phí" tiếng Việt** | 18 | 19 | 12 | 13 | 12 | 10 | 4 | **88** ✅ |
| 2 | Site affiliate review công cụ AI (tiếng Anh) | 18 | 17 | 6 | 12 | 13 | 10 | 4 | 79 |
| 3 | Bán bộ prompt/ebook số (tiếng Việt) | 12 | 16 | 10 | 8 | 14 | 10 | 4 | 74 |
| 4 | Web tool giải quyết 1 vấn cụ (máy tính/công cụ miễn phí) | 14 | 18 | 10 | 9 | 10 | 10 | 4 | 75 |
| 5 | Danh bạ/so sánh dịch vụ ngách địa phương | 10 | 12 | 11 | 7 | 8 | 9 | 3 | 60 |
| 6 | Thu hút khách hàng tiềm năng cho dịch vụ freelance | 12 | 10 | 8 | 9 | 11 | 9 | 2 | 61 |
| 7 | Blog tài chính cá nhân/ngách rủi ro cao (y tế, đầu tư) | 13 | 12 | 7 | 10 | 10 | 9 | 1 | 62 |
| 8 | Newsletter curation AI | 11 | 12 | 8 | 6 | 9 | 10 | 4 | 60 |
| 9 | Tài nguyên cho người chạy Ollama cục bộ (tiếng Anh) | 9 | 16 | 12 | 6 | 8 | 10 | 4 | 65 |

### Nguồn nghiên cứu (2026-10-29)
- Nhu cầu "free AI tools / no credit card": hàng loạt site lớn xếp hạng chủ đề này (poweredbyai.app, aitoolbox.hk, aieasypick.com…) → nhu cầu thật, nội dung **tiếng Việt còn mỏng** [quan sát search, chưa xác minh bằng số liệu].
- SEO 2026: nội dung ngách từ khóa dài (4–7 từ), ưu tiên chất lượng/ chiều sâu thay vì số lượng (trafficthat.com, vietnammarketing.com.vn).
- Affiliate công cụ AI: ~22/28 chương trình trả hoa hồng định kỳ, mức trung vị ~30% (PartnersWatch, 2026-10) [chưa xác minh từng chương trình — cần đăng ký và được chấp thuận trước khi dùng link].

## 3. Quyết định: Ý tưởng #1

**Sản phẩm:** "Sổ Tay AI" — website tiếng Việt với (a) danh bạ công cụ AI có phiên bản miễn phí thật (tìm kiếm/lọc client-side, không cần backend), (b) các hướng dẫn theo từng bước, kiểm chứng được ("bắt đầu AI miễn phí trong 10 phút", "so sánh ChatGPT vs Gemini vs Copilot ở chế độ free").

**Lý do thắng:**
- Nhu cầu thật, được xác nhận bởi thị trường quốc tế; góc tiếng Việt ít cạnh tranh hơn (hàng rào: chất lượng + cập nhật).
- Sản phẩm hữu ích ngay khi không có traffic (công cụ tìm kiếm danh bạ + hướng dẫn dùng được ngay).
- Chi phí 0đ: site tĩnh trên GitHub Pages (deploy tự động), nội dung sản xuất bằng Ollama cục bộ, không API trả phí.
- **Đường doanh thu (sắp xếp theo thứ tự ưu tiên, tất cả 0đ chi phí ban đầu):**
  1. *Sản phẩm số (đã triển khai ngay):* "Prompt &amp; Template Kit" — nội dung gốc do chính hệ thống biên tập (không sao chép, có quyền phân phối), **bản miễn phí tải về được thật** ở trang /product/ (dẫn lưu lượng + tạo uy tín). Bản nâng cao (nếu có) chỉ kích hoạt qua 1 link thanh toán thật (Gumroad/Stripe) — **không làm checkout giả, không cam kết giá khi chưa có**.
  2. *Affiliate công cụ AI (cơ chế sẵn sàng, chờ đăng ký thật):* mỗi công cụ trong `tools.json` có trường tuỳ chọn `affiliateUrl` + `affiliateProgram`; khi điền, trang /tools/ tự động gắn nhãn "liên kết đối tác" + disclosure. Chỉ bật sau khi đăng ký chương trình và được chấp thuận (trung vị hoa hồng ~30% theo nguồn — *chưa xác minh từng chương trình*).

**Khách hàng mục tiêu:** người dùng Việt Nam tuổi 16–35, biết dùng máy tính, chưa có kinh nghiệm AI, không muốn trả phí (học sinh/sinh viên, người mới đi làm, chủ shop nhỏ).

**Vấn đề giải quyết:** "Có quá nhiều công cụ AI, không biết cái nào dùng miễn phí thật (không cần thẻ), và bắt đầu từ đâu để làm được việc ngay."

**MVP (ngân sách hiện tại):**
1. Trang chủ + danh bạ 15–20 công cụ AI free có filter (không cần backend).
2. 3 hướng dẫn mẫu được viết và kiểm tra (không bịa số liệu).
3. Pipeline nội dung Ollama (chế độ draft là mặc định) + bộ kiểm tra chất lượng.
4. Hosting tĩnh miễn phí, tự động hóa lịch chạy cục bộ.

**Giả định cần kiểm chứng bằng người dùng thật:**
- Người Việt có tìm "cách dùng AI miễn phí" trên Google đủ để đưa site lên hạng trong 3–6 tháng [chưa xác minh].
- Chương trình affiliate AI chấp nhận site mới không traffic [chưa xác minh].
- Ollama 4B chạy tốt trên 16GB RAM cho chất lượng bài viết chấp nhận được [chưa xác minh — sẽ test thực tế].
