# Chạy nền: chờ repo 'so-tay-ai' được tạo trên GitHub (bằng Cốc Cốc),
# rồi tự push (Git Credential Manager mở Cốc Cốc để xác thực, dùng session đăng nhập sẵn),
# và xác nhận push thành công. Không làm gì khác.
$Repo = 'so-tay-ai'
$User = 'legiaptuanson1234-collab'
$Root = 'E:\KIEMTIEN'
$Log  = Join-Path $Root 'pipeline\logs\push.log'
New-Item -ItemType Directory -Force (Split-Path $Log) | Out-Null
Add-Content $Log "=== push-when-repo-ready bắt đầu $(Get-Date -Format s) ==="

# 1) Chờ repo tồn tại (tối đa 20 phút, check mỗi 20s)
$repo = $null
for ($i = 0; $i -lt 60; $i++) {
    $r = Invoke-RestMethod "https://api.github.com/repos/$User/$Repo" -ErrorAction SilentlyContinue
    if ($r -and $r.full_name) { $repo = $r; Add-Content $Log "Repo đã có: $($r.full_name)"; break }
    Start-Sleep 20
}
if (-not $repo) {
    Add-Content $Log "Chưa có repo sau 20 phút. Dừng. Tạo repo trong Cốc Cốc rồi chạy lại script."
    exit 1
}

# 2) Push (GCM sẽ mở Cốc Cốc để xác thực nếu chưa lưu token)
Set-Location $Root
git push -u origin main 2>&1 | ForEach-Object { Add-Content $Log $_ }
$code = $LASTEXITCODE
Add-Content $Log "git push exit=$code"

# 3) Xác nhận
$heads = Invoke-RestMethod "https://api.github.com/repos/$User/$Repo/commits" -ErrorAction SilentlyContinue
if ($heads -and $heads.Count -gt 0) {
    Add-Content $Log ("OK: đã push. Số commit trên GitHub: " + $heads.Count + " (mới nhất: " + $heads[0].sha + ")")
    exit 0
} else {
    Add-Content $Log "Push chưa xác nhận được (auth?). Kiểm tra Cốc Cốc có hiện màn 'Authorize Git Credential Manager' không."
    exit 2
}
