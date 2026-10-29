# Tải Ollama Windows portable (không cần admin) về tools/ollama/.
# Chạy 1 lần: powershell -File tools/download-ollama.ps1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Dir = Join-Path $Root 'tools\ollama'
New-Item -ItemType Directory -Force -Path $Dir | Out-Null
Set-Location $Dir

$Latest = (Invoke-RestMethod -Uri 'https://api.github.com/repos/ollama/ollama/releases/latest' -TimeoutSec 30).tag_name
$Url = "https://github.com/ollama/ollama/releases/download/$Latest/ollama-windows-amd64.zip"
$Zip = Join-Path $Dir 'ollama.zip'
Write-Host "Tải Ollama $Latest..."
Invoke-WebRequest -Uri $Url -OutFile $Zip -UseBasicParsing
Expand-Archive -Path $Zip -DestinationPath $Dir -Force
Remove-Item $Zip -Force
Write-Host "OK. Tiếp theo:"
Write-Host "  .\ollama.exe pull qwen2.5:7b"
Write-Host "  Start-Process .\ollama.exe -ArgumentList 'serve' -WindowStyle Hidden"
