# Tự động hoá (Windows Task Scheduler)

Tự động hoá của hệ thống chạy **trên máy bạn** (không phải cloud) — vì Ollama là AI cục bộ,
GitHub Actions không thể gọi model đang chạy trên máy cá nhân trừ khi mở port Ollama ra Internet
(**chúng ta không làm việc đó** — không an toàn).

## Nhiệm vụ được lên lịch

| Nhiệm vụ | Lệnh | Gợi ý tần suất | Ghi chú |
|---|---|---|---|
| Sinh 1 bản nháp (draft) | `node pipeline/src/cli.ts --mode draft` | 2–3 lần/tuần | An toàn, không công bố gì |
| (Tùy chọn) Review nháp | `node pipeline/src/cli.ts --mode review` | Sau mỗi draft | Chờ con người duyệt |

**Publish không được lên lịch mặc định.** Sau khi bạn thấy nháp ổn định (3–5 bài pass reviewer
liên tục, không cần sửa tay), hãy tự quyết định bật publish:

```powershell
$env:PIPELINE_MODE='publish'; node pipeline/src/cli.ts
```

Pipeline vẫn có khoá (lockfile) chống chạy chồng và ngưỡng an toàn (reviewer pass + score ≥ 60),
nên chế độ publish lên lịch **không** nghĩa là xuất bản mù: bài không đạt ngưỡng sẽ chỉ dừng
ở dạng nháp được lưu.

## Script

- `automation/enable-task.ps1` — tạo Task Scheduler task `SoTayAI-Content` (mặc định chạy draft mỗi 3 ngày lúc 02:00, chỉ khi máy bật + user đã đăng nhập, + Ollama phải chạy).
- `automation/disable-task.ps1` — xoá task.
- `automation/pipeline-once.ps1` — script gốc được task gọi: khởi động Ollama nếu chưa chạy, chạy pipeline theo `PIPELINE_MODE` (mặc định `draft`), ghi log ra `pipeline/logs/`.

## Cấu hình

Mở `automation/pipeline-once.ps1` và sửa các hằng ở đầu file nếu cần:
- `$Mode = 'draft'` → `review` hoặc `publish` (xem cảnh báo ở trên).
- `$IntervalDays = 3` → tần suất (cũng chỉnh trực tiếp trong Task Scheduler).

## Xử lý lỗi (đăng trong pipeline/logs/<topic>.log và pipeline/logs/task.log)

| Sự kiện | Hành xử |
|---|---|
| Ollama chưa chạy | Script tự cố `ollama serve` (idempotent), đợi 10s; vẫn fail → ghi log + exit 4, KHÔNG chạy pipeline |
| Model chưa tải | Log rõ tên model thiếu, hướng dẫn `ollama pull`; exit 4 |
| Pipeline đang chạy (lock) | Exit 3 ngay, không chạy chồng |
| Bản nháp rỗng/reviewer lỗi | Log + giữ nháp (nếu có); exit 1 |
| Máy ngủ/mất điện giữa chừng | Lockfile có mốc thời gian; task kế tiếp sẽ xoá lock cũ (>30 phút) tự động |

## Lưu ý điện & phần cứng

Máy phải **đang bật, không Sleep, Ollama chạy được** — Task Scheduler không đánh thức máy
ngủ cho task này (đặt `WakeToRun` nếu muốn, nhưng tốn điện). Chi phí thực: điện + CPU/GPU
~1–3 phút mỗi lần chạy, 0đ tiền mặt.
