# WebP + сжатие JPG. PNG-оригиналы не перезаписываются (только .webp рядом).
# Запуск: powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ToolsDir = Join-Path $Root ".tools"
$Cwebp = Join-Path $ToolsDir "cwebp.exe"

function Ensure-Cwebp {
  if (Test-Path $Cwebp) { return }
  New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null
  $zipUrl = "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.4.0-windows-x64.zip"
  $zipPath = Join-Path $ToolsDir "libwebp.zip"
  Write-Host "Downloading cwebp..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
  Expand-Archive -Path $zipPath -DestinationPath $ToolsDir -Force
  $found = Get-ChildItem -Path $ToolsDir -Recurse -Filter "cwebp.exe" | Select-Object -First 1
  if (-not $found) { throw "cwebp.exe not found" }
  Copy-Item $found.FullName $Cwebp -Force
  Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

function Get-Encoder($mime) {
  [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq $mime } |
    Select-Object -First 1
}

function Compress-JpegInPlace {
  param([string]$Path, [int]$MaxWidth, [int]$Quality)
  $before = [math]::Round((Get-Item $Path).Length / 1KB)
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
    $tmp = [System.IO.Path]::GetTempFileName() + ".jpg"
    $codec = Get-Encoder "image/jpeg"
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
      [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality
    )
    $img.Save($tmp, $codec, $ep)
    $ep.Dispose()
  } finally {
    if ($img) { $img.Dispose() }
  }
  Copy-Item $tmp $Path -Force
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  $after = [math]::Round((Get-Item $Path).Length / 1KB)
  return @{ Before = $before; After = $after }
}

function New-Webp {
  param(
    [string]$Path,
    [int]$MaxWidth = 0,
    [int]$Quality = 82
  )
  $webpPath = $Path -replace '\.(png|jpe?g)$', '.webp'
  $args = @("-quiet", "-q", $Quality)
  if ($MaxWidth -gt 0) { $args += @("-resize", $MaxWidth, 0) }
  $args += @($Path, "-o", $webpPath)
  & $Cwebp @args
  if ($LASTEXITCODE -ne 0) { throw "cwebp failed: $Path" }
  return $webpPath
}

function Process-Asset {
  param(
    [string]$Path,
    [int]$MaxWidth,
    [int]$WebpQuality,
    [int]$JpegQuality = 84,
    [switch]$CompressJpeg
  )
  if (-not (Test-Path $Path)) { return }
  $ext = [System.IO.Path]::GetExtension($Path).ToLower()
  $rel = $Path.Substring($Root.Length).TrimStart('\', '/')

  $webp = New-Webp -Path $Path -MaxWidth $MaxWidth -Quality $WebpQuality
  $webpKb = [math]::Round((Get-Item $webp).Length / 1KB)

  if ($CompressJpeg -and ($ext -eq ".jpg" -or $ext -eq ".jpeg")) {
    $j = Compress-JpegInPlace -Path $Path -MaxWidth $MaxWidth -Quality $JpegQuality
    Write-Host "  $rel : jpg $($j.Before)->$($j.After) KB, webp ${webpKb} KB"
  } else {
    $srcKb = [math]::Round((Get-Item $Path).Length / 1KB)
    Write-Host "  $rel : ${srcKb} KB (unchanged), webp ${webpKb} KB"
  }
}

Ensure-Cwebp
Write-Host "Optimizing in $Root`n"

@(
  @{ Path = "arctic-aurora.png"; Max = 960; Q = 82 },
  @{ Path = "arctic-glass.png"; Max = 900; Q = 80 },
  @{ Path = "arctic-ice.png"; Max = 900; Q = 80 },
  @{ Path = "arctic-snow.png"; Max = 900; Q = 80 },
  @{ Path = "hero-portrait.jpg"; Max = 960; Q = 82; Jpg = $true }
) | ForEach-Object {
  Process-Asset -Path (Join-Path $Root $_.Path) -MaxWidth $_.Max -WebpQuality $_.Q -CompressJpeg:([bool]$_.Jpg)
}

$photoDir = Get-ChildItem $Root -Directory |
  Where-Object { (Get-ChildItem $_.FullName -Filter *.jpg -EA SilentlyContinue).Count -ge 10 } |
  Select-Object -First 1 -ExpandProperty FullName
if ($photoDir) {
  $photos = Get-ChildItem -LiteralPath $photoDir -File | Where-Object { $_.Extension -match '\.(jpe?g|png)$' }
  Write-Host "`nФото/ ($($photos.Count) files):"
  foreach ($p in $photos) {
    $isPng = $p.Extension -eq ".png"
    Process-Asset -Path $p.FullName -MaxWidth 1920 -WebpQuality 78 -JpegQuality 82 -CompressJpeg:(-not $isPng)
  }
}

Write-Host "`nDone."
