# Script gốc được Windows Task Scheduler gọi (xem AUTOMATION.md).
# Mặc định: mode=draft (an toàn). Muốn publish, sửa $Mode và chịu trách nhiệm theo SECURITY.md.
param([string]$Mode = 'draft')

$Root = 'E:\KIEMTIEN'
$OllamaExe = Join-Path $Root 'tools\ollama\ollama.exe'
$OllamaUrl = if ($env:OLLAMA_URL) { $env:OLLAMA_URL } else { 'http://127.0.0.1:11434' }
$Model = if ($env:OLLAMA_MODEL) { $env:OLLAMA_MODEL } else { 'qwen2.5:7b' }

$taskLog = Join-Path $Root 'pipeline\logs\task.log'
Add-Content -Path $taskLog -Value "=== $($Mode) bắt đầu $(Get-Date -Format s) ==="

# 1) Đảm bảo Ollama đang chạy (idempotent)
try {
    $probe = Invoke-RestMethod -Uri "$OllamaUrl/api/tags" -TimeoutSec 5 -ErrorAction Stop
} catch {
    Add-Content -Path $taskLog -Value "Ollama chưa chạy -> khởi động ollama serve"
    Start-Process -FilePath $OllamaExe -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep 12
    try {
        Invoke-RestMethod -Uri "$OllamaUrl/api/tags" -TimeoutSec 10 | Out-Null
    } catch {
        Add-Content -Path $taskLog -Value "LỖI: Ollama không sẵn sàng. Không chạy pipeline."
        exit 4
    }
}

# 2) Kiểm tra model có tồn tại
$tags = (Invoke-RestMethod -Uri "$OllamaUrl/api/tags").models.name
if (-not ($tags -like "$Model*" -or ($Model -match '^(\w+):' -and ($tags -contains ($Model -split ':')[0]) -or $tags -contains $Model))) {
    Add-Content -Path $taskLog -Value "LỖI: model '$Model' chưa tải. Chạy: $OllamaExe pull $Model"
    exit 4
}

# 3) Chạy pipeline
Push-Location $Root
try {
    node pipeline/src/cli.ts --mode $Mode 2>&1 | ForEach-Object { Add-Content -Path $taskLog -Value $_ }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
