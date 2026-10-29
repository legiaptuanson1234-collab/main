# Tạo Task Scheduler task "SoTayAI-Content" chạy pipeline (mặc định mode=draft).
# Yêu cầu: chạy bằng quyền user hiện tại (không cần admin cho task của user).
$TaskName = 'SoTayAI-Content'
$Root = 'E:\KIEMTIEN'
$ScriptPath = Join-Path $Root 'automation\pipeline-once.ps1'

# Xóa task cũ nếu có (để cấu hình lại)
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" -Mode draft" `
    -WorkingDirectory $Root

# Chạy mỗi 3 ngày, lần đầu vào 02:00 hôm sau. Muốn đổi: sửa -DaysInterval / -At.
$trigger = New-ScheduledTaskTrigger -Daily -At '02:00AM' -DaysInterval 3

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartOnDemand `
    -DontStopIfGoingOnBatteries:$false `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 1 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# -User: task chạy với phiên user hiện tại (Ollama + node đều user-level).
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -User $env:USERNAME -Password '' -ErrorVariable err
if ($err.Count -eq 0) {
    Write-Host "Đã tạo task '$TaskName'. Kiểm tra: schtasks /Query /TN $TaskName"
} else {
    Write-Warning "Có lỗi khi đăng ký: $($err -join '; ')"
    Write-Host "Gợi ý: chạy lại script bằng PowerShell thường (không cần admin nếu task của user), hoặc tạo task qua GUI: schtasks /Create /SC DAILY /RI 720 ..."
}
