# Tạo Task Scheduler task "SoTayAI-Content" chạy pipeline (mặc định mode=draft — an toàn).
# Task chạy trong phiên user hiện tại (Ollama + node đều user-level), không cần admin.
$ErrorActionPreference = 'Stop'
$TaskName = 'SoTayAI-Content'
$Root = 'E:\KIEMTIEN'
$ScriptPath = Join-Path $Root 'automation\pipeline-once.ps1'

# Xóa task cũ nếu có (để cấu hình lại được)
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" -Mode draft" `
    -WorkingDirectory $Root

# Chạy mỗi 3 ngày vào 02:00. Muốn đổi: sửa -DaysInterval / -At bên dưới.
$trigger = New-ScheduledTaskTrigger -Daily -At '02:00AM' -DaysInterval 3

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 1 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# Không truyền -User/-Password: task đăng ký với tài khoản chạy script
# (chế độ "chỉ khi user đã đăng nhập" — đúng mức cần cho Ollama local,
# không cấp quyền rộng hơn mức tối thiểu).
try {
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings | Out-Null
    Write-Host "OK: đã tạo task '$TaskName' (daily, mỗi 3 ngày, 02:00, mode=draft)."
    Write-Host "Kiểm tra: schtasks /Query /TN $TaskName"
    Write-Host "Tắt: powershell automation\disable-task.ps1"
} catch {
    Write-Warning "Đăng ký task thất bại: $($_.Exception.Message)"
    Write-Host "Gợi ý: chạy script này trong PowerShell thường của bạn (không bắt buộc admin)."
}
