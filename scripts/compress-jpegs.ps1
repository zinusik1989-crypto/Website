$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$photoDir = Get-ChildItem $Root -Directory |
  Where-Object { (Get-ChildItem $_.FullName -Filter *.jpg -EA SilentlyContinue).Count -ge 10 } |
  Select-Object -First 1 -ExpandProperty FullName

function Compress-Jpeg([string]$Path, [int]$MaxWidth, [int]$Quality) {
  $img = [System.Drawing.Image]::FromFile($Path)
  try {
    if ($img.Width -gt $MaxWidth) {
      $nw = $MaxWidth
      $nh = [int][math]::Round($img.Height * ($MaxWidth / $img.Width))
      $bmp = New-Object System.Drawing.Bitmap $nw, $nh
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.DrawImage($img, 0, 0, $nw, $nh)
      $g.Dispose()
      $img.Dispose()
      $img = $bmp
    }
    $tmp = [IO.Path]::GetTempFileName() + ".jpg"
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
      Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
      [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality
    )
    $img.Save($tmp, $enc, $ep)
    $ep.Dispose()
  } finally {
    if ($img) { $img.Dispose() }
  }
  Copy-Item $tmp $Path -Force
  Remove-Item $tmp -Force
}

$before = 0
$after = 0
Get-ChildItem -LiteralPath $photoDir -Filter *.jpg | ForEach-Object {
  $before += $_.Length
  Compress-Jpeg $_.FullName 1920 82
  $after += (Get-Item $_.FullName).Length
}
Write-Host ("JPG total: {0} KB -> {1} KB" -f [math]::Round($before/1KB), [math]::Round($after/1KB))
