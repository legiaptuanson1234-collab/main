# Script gốc được Windows Task Scheduler gọi (xem AUTOMATION.md).
# Mặc định: mode=draft (an toàn). Muốn publish, sửa $Mode và chịu trách nhiệm theo SECURITY.md.
param([string]$Mode = 'draft')

$Root = 'E:\KIEMTIEN'
$OllamaExe = Join-Path $Root 'tools\ollama\ollama.exe'
$OllamaUrl = if ($env:OLLAMA_URL) { $env:OLLAMA_URL } else { 'http://127.0.0.1:11434' }
$Model = if ($env:OLLAMA_MODEL) { $env:OLLAMA_MODEL } else { 'qwen2.5:7b' }

# Dùng Node hệ thống (không dùng 'node' trong PATH vì có thể trỏ vào node của tool khác).
$NodeExe = 'C:\Program Files\nodejs\node.exe'
if (-not (Test-Path $NodeExe)) {
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { $NodeExe = $cmd.Source } else {
        Write-Host 'LỖI: không tìm thấy node.exe (cài Node.js LTS trước).'
        exit 5
    }
}

$taskLog = Join-Path $Root 'pipeline\logs\task.log'
New-Item -ItemType Directory -Force (Split-Path $taskLog) | Out-Null
Add-Content -Path $taskLog -Value "=== mode=$Mode bắt đầu $(Get-Date -Format s) ==="

# 1) Đảm bảo Ollama đang chạy (idempotent)
try {
    Invoke-RestMethod -Uri "$OllamaUrl/api/tags" -TimeoutSec 5 -ErrorAction Stop | Out-Null
} catch {
    Add-Content -Path $taskLog -Value "Ollama chưa chạy -> khởi động ollama serve"
    if (Test-Path $OllamaExe) {
        Start-Process -FilePath $OllamaExe -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep 15
    } else {
        Add-Content -Path $taskLog -Value "LỖI: thiếu $OllamaExe — chạy tools\download-ollama.ps1 trước."
        exit 4
    }
    try {
        Invoke-RestMethod -Uri "$OllamaUrl/api/tags" -TimeoutSec 10 | Out-Null
    } catch {
        Add-Content -Path $taskLog -Value "LỖI: Ollama không sẵn sàng sau khi khởi động. Không chạy pipeline."
        exit 4
    }
}

# 2) Kiểm tra model có tồn tại
$names = (Invoke-RestMethod -Uri "$OllamaUrl/api/tags").models.name
$haveModel = $names -contains $Model -or ($Model -match '^([\w.]+):' -and $names -like "$($matches[1]):*")
if (-not $haveModel) {
    Add-Content -Path $taskLog -Value "LỖI: model '$Model' chưa tải. Chạy: $OllamaExe pull $Model"
    exit 4
}

# 3) Chạy pipeline, ghép stdout+stderr vào log (PS 5.1: 2>&1 trước >>)
Push-Location $Root
try {
    & $NodeExe pipeline/src/cli.ts --mode $Mode 2>&1 | ForEach-Object { $line = $_.ToString(); Add-Content -Path $taskLog -Value $line }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
