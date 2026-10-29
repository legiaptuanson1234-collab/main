# Đợi deploy Pages cho commit mới nhất, rồi verify-public
$target = (git -C 'E:\KIEMTIEN' rev-parse --short HEAD)
Write-Host "Đợi Pages deploy cho commit: $target"
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep 20
  $runs = Invoke-RestMethod "https://api.github.com/repos/legiaptuanson1234-collab/main/actions/runs?per_page=5" -TimeoutSec 15
  $deploy = $runs.workflow_runs | Where-Object { $_.name -eq 'Deploy to GitHub Pages' } | Select-Object -First 1
  if ($deploy) {
    Write-Host ("Deploy run: head=" + $deploy.head_sha.Substring(0,7) + " status=" + $deploy.status + " conclusion=" + $deploy.conclusion)
    if ($deploy.head_sha.StartsWith($target) -and $deploy.status -eq 'completed') {
      if ($deploy.conclusion -eq 'success') {
        Write-Host "Deploy thành công -> chạy verify-public"
        & "C:\Program Files\nodejs\node.exe" "E:\KIEMTIEN\tools\verify-public.mjs"
        exit $LASTEXITCODE
      } else {
        Write-Host "Deploy thất bại: $deploy.conclusion (xem tab Actions trong Cốc Cốc)"
        exit 1
      }
    }
  } else {
    Write-Host "Chưa thấy deploy run (đợi tiếp...) - thử $i"
  }
}
Write-Host "Hết giờ đợi, kiểm tra tay: github.com/legiaptuanson1234-collab/main/actions"
