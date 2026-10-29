# Xoá Task Scheduler task "SoTayAI-Content"
Unregister-ScheduledTask -TaskName 'SoTayAI-Content' -Confirm:$false
Write-Host "Đã xoá task. Pipeline không còn chạy tự động; chạy tay bằng: node pipeline/src/cli.ts --mode draft"
