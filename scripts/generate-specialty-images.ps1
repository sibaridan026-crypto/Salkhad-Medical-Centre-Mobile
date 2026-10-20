# Generates the 14 specialty cover images used by the mobile patient UI.
#
# IMPORTANT / PROVENANCE
# ----------------------
# These are GENERATED flat illustration covers, not photographs and not
# third-party artwork. They are produced locally from the brand palette and the
# already-installed MaterialCommunityIcons font, so the set is 100% consistent,
# carries no branding, no gore and no readable text, and does not copy the
# supplied reference collage or any external asset.
#
# Re-running this script reproduces the exact same files. The generated PNGs are
# committed under assets/specialties/ and referenced from src/data.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/generate-specialty-images.ps1
#
# NOTE: the icon glyphs live in the Unicode Supplementary Multilingual Plane
# (e.g. U+F09D1). GDI+/System.Drawing silently fails to rasterise those from
# this font, so glyphs are rendered with WPF (which handles them correctly) on a
# transparent layer and then composited with GDI+. WPF rendering needs an STA
# thread, so the script re-launches itself in STA if necessary.

if ([System.Threading.Thread]::CurrentThread.GetApartmentState() -ne [System.Threading.ApartmentState]::STA) {
  & powershell -STA -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath
  exit $LASTEXITCODE
}

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'assets\specialties'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$iconRoot = Join-Path $root 'node_modules\@expo\vector-icons\build\vendor\react-native-vector-icons'
$glyphMapPath = Join-Path $iconRoot 'glyphmaps\MaterialCommunityIcons.json'
$ttfPath = Join-Path $iconRoot 'Fonts\MaterialCommunityIcons.ttf'

if (-not (Test-Path $glyphMapPath)) { throw "glyph map not found: $glyphMapPath" }
if (-not (Test-Path $ttfPath)) { throw "icon font not found: $ttfPath" }

$glyphMap = Get-Content $glyphMapPath -Raw | ConvertFrom-Json

# WPF typeface for the icon font (supports supplementary-plane glyphs).
$fontUri = 'file:///' + ($ttfPath -replace '\\', '/') + '#Material Design Icons'
$iconFamily = [System.Windows.Media.FontFamily]::new($fontUri)
$iconTypeface = [System.Windows.Media.Typeface]::new($iconFamily)

$glyphEm = 126
$glyphBox = 150
$tempDir = Join-Path $env:TEMP 'salkhad-specialty-glyphs'
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

function HexColor([string]$hex, [int]$alpha = 255) {
  $h = $hex.TrimStart('#')
  $r = [Convert]::ToInt32($h.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($h.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($h.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
}

function RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# Rasterise one icon glyph onto a transparent PNG using WPF.
function New-GlyphPng([int]$code, [string]$hex, [string]$outPath) {
  $ch = [char]::ConvertFromUtf32($code)
  $h = $hex.TrimStart('#')
  $col = [System.Windows.Media.Color]::FromRgb(
    [Convert]::ToByte($h.Substring(0, 2), 16),
    [Convert]::ToByte($h.Substring(2, 2), 16),
    [Convert]::ToByte($h.Substring(4, 2), 16))
  $brush = [System.Windows.Media.SolidColorBrush]::new($col)
  $ft = [System.Windows.Media.FormattedText]::new(
    $ch,
    [System.Globalization.CultureInfo]::InvariantCulture,
    [System.Windows.FlowDirection]::LeftToRight,
    $iconTypeface,
    [double]$glyphEm,
    $brush,
    1.0)
  $dv = [System.Windows.Media.DrawingVisual]::new()
  $dc = $dv.RenderOpen()
  $originX = ($glyphBox - $ft.Width) / 2
  $originY = ($glyphBox - $ft.Height) / 2
  $dc.DrawText($ft, [System.Windows.Point]::new($originX, $originY))
  $dc.Close()
  $rtb = [System.Windows.Media.Imaging.RenderTargetBitmap]::new(
    $glyphBox, $glyphBox, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $rtb.Render($dv)
  $enc = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
  $fs = [System.IO.File]::Create($outPath)
  $enc.Save($fs)
  $fs.Close()
}

$palette = @{
  purple   = @{ base = '#6D4AC4'; light = '#F6F1FE'; mid = '#E6DAFB' }
  blue     = @{ base = '#2B5FA8'; light = '#EEF4FC'; mid = '#D6E5F7' }
  teal     = @{ base = '#2E9FB0'; light = '#EBF8F9'; mid = '#CDECF0' }
  lavender = @{ base = '#8B6FD0'; light = '#F7F2FD'; mid = '#EADDF9' }
}

# One consistent style, one accent per specialty (cycled for balance).
$specialties = @(
  @{ id = 'neurosurgery';      glyph = 'brain';                 accent = 'purple' },
  @{ id = 'pediatrics';        glyph = 'baby-face-outline';     accent = 'teal' },
  @{ id = 'obstetrics';        glyph = 'human-pregnant';        accent = 'lavender' },
  @{ id = 'cardiology';        glyph = 'heart-pulse';           accent = 'blue' },
  @{ id = 'ent';               glyph = 'ear-hearing';           accent = 'teal' },
  @{ id = 'physiotherapy';     glyph = 'arm-flex-outline';      accent = 'purple' },
  @{ id = 'urology';           glyph = 'water-outline';         accent = 'blue' },
  @{ id = 'orthopedics';       glyph = 'bone';                  accent = 'teal' },
  @{ id = 'general-surgery';   glyph = 'medical-bag';           accent = 'purple' },
  @{ id = 'endocrinology';     glyph = 'water-percent';         accent = 'blue' },
  @{ id = 'dermatology';       glyph = 'spa';                   accent = 'lavender' },
  @{ id = 'gastroenterology';  glyph = 'stomach';               accent = 'teal' },
  @{ id = 'rheumatology';      glyph = 'hand-heart-outline';    accent = 'purple' },
  @{ id = 'psychiatry';        glyph = 'head-heart-outline';    accent = 'lavender' }
)

$W = 720
$H = 480
$shadowColor = HexColor '#2E1F52' 255

foreach ($s in $specialties) {
  $pal = $palette[$s.accent]
  $base = HexColor $pal.base
  $light = HexColor $pal.light
  $mid = HexColor $pal.mid

  $bmp = [System.Drawing.Bitmap]::new($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  # Background: soft diagonal gradient.
  $rect = [System.Drawing.Rectangle]::new(0, 0, $W, $H)
  $grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $light, $mid, [float]35)
  $g.FillRectangle($grad, $rect)
  $grad.Dispose()

  # Decorative translucent circles for depth.
  $b1 = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38, $base.R, $base.G, $base.B))
  $b2 = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(26, $base.R, $base.G, $base.B))
  $g.FillEllipse($b1, -70, -90, 300, 300)
  $g.FillEllipse($b2, $W - 230, $H - 240, 340, 340)
  $b1.Dispose(); $b2.Dispose()

  # Faint medical plus-sign pattern.
  $plusPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(20, $base.R, $base.G, $base.B), 2)
  for ($py = 46; $py -lt $H; $py += 96) {
    for ($px = 46; $px -lt $W; $px += 96) {
      $g.DrawLine($plusPen, $px - 6, $py, $px + 6, $py)
      $g.DrawLine($plusPen, $px, $py - 6, $px, $py + 6)
    }
  }
  $plusPen.Dispose()

  # Central icon well with a soft shadow.
  $wellSize = 216
  $wellX = ($W - $wellSize) / 2
  $wellY = ($H - $wellSize) / 2
  for ($i = 12; $i -ge 1; $i--) {
    $inflate = $i * 3
    $sp = RoundedPath ($wellX - $inflate) ($wellY - $inflate) ($wellSize + $inflate * 2) ($wellSize + $inflate * 2) (58 + $inflate)
    $sb = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(5, $shadowColor.R, $shadowColor.G, $shadowColor.B))
    $g.FillPath($sb, $sp)
    $sb.Dispose(); $sp.Dispose()
  }

  $wellPath = RoundedPath $wellX $wellY $wellSize $wellSize 58
  $wellBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $g.FillPath($wellBrush, $wellPath)
  $wellBrush.Dispose()

  # Thin accent ring around the well.
  $ringPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(60, $base.R, $base.G, $base.B), 2)
  $g.DrawPath($ringPen, $wellPath)
  $ringPen.Dispose()

  # Glyph, centered in the well, in the accent colour (WPF-rasterised).
  if (-not $glyphMap.PSObject.Properties.Name.Contains($s.glyph)) {
    throw "glyph not found in font: $($s.glyph)"
  }
  $code = [int]$glyphMap.$($s.glyph)
  $glyphPng = Join-Path $tempDir ($s.id + '.png')
  New-GlyphPng $code $pal.base $glyphPng
  $glyphImage = [System.Drawing.Image]::FromFile($glyphPng)
  $glyphX = $wellX + ($wellSize - $glyphBox) / 2
  $glyphY = $wellY + ($wellSize - $glyphBox) / 2
  $g.DrawImage($glyphImage, [float]$glyphX, [float]$glyphY, [float]$glyphBox, [float]$glyphBox)
  $glyphImage.Dispose()

  $wellPath.Dispose()

  $outPath = Join-Path $outDir ($s.id + '.png')
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Output ("wrote {0}" -f $outPath)
}

Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Output ("done: {0} specialty images" -f $specialties.Count)
