Add-Type -AssemblyName System.Drawing

$logoPath = "c:/Users/hikih/Documents/Repositorios/app-ricra/logo-original.png"
if (-not (Test-Path $logoPath)) {
    Write-Error "logo-original.png not found"
    exit 1
}

$srcLogo = [System.Drawing.Bitmap]::FromFile($logoPath)
$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#F4F6EE")

# 1. Update background color XML
$bgXmlPath = "c:/Users/hikih/Documents/Repositorios/app-ricra/android/app/src/main/res/values/ic_launcher_background.xml"
$bgXmlContent = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#F4F6EE</color>
</resources>
"@
Set-Content -Path $bgXmlPath -Value $bgXmlContent -Encoding UTF8

# 2. Delete legacy blue foreground vector in drawable-v24 if present
$blueVector = "c:/Users/hikih/Documents/Repositorios/app-ricra/android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml"
if (Test-Path $blueVector) {
    Remove-Item $blueVector -Force
    Write-Host "Removed blue capacitor foreground vector."
}

# Helper to draw centered bitmap
function Draw-Centered($destGraphics, $src, $destW, $destH, $innerScale) {
    $targetSize = [int]($destW * $innerScale)
    $x = [int](($destW - $targetSize) / 2)
    $y = [int](($destH - $targetSize) / 2)
    $destGraphics.DrawImage($src, $x, $y, $targetSize, $targetSize)
}

# Foreground adaptive icons (108dp base canvas, inner 72dp safe area = 0.666 scale)
$foregroundSizes = @{
    "mipmap-mdpi" = 108
    "mipmap-hdpi" = 162
    "mipmap-xhdpi" = 216
    "mipmap-xxhdpi" = 324
    "mipmap-xxxhdpi" = 432
}

# Standard launcher icons (48dp base canvas)
$launcherSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

$resBase = "c:/Users/hikih/Documents/Repositorios/app-ricra/android/app/src/main/res"

foreach ($entry in $foregroundSizes.GetEnumerator()) {
    $folder = Join-Path $resBase $entry.Key
    if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder | Out-Null }
    $size = $entry.Value

    # Adaptive Foreground (transparent background, logo in safe center)
    $fgBmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($fgBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    Draw-Centered $g $srcLogo $size $size 0.70
    $fgBmp.Save((Join-Path $folder "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $fgBmp.Dispose()
}

foreach ($entry in $launcherSizes.GetEnumerator()) {
    $folder = Join-Path $resBase $entry.Key
    $size = $entry.Value

    # Square / Rounded launcher icon
    $sqBmp = New-Object System.Drawing.Bitmap($size, $size)
    $gSq = [System.Drawing.Graphics]::FromImage($sqBmp)
    $gSq.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gSq.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gSq.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gSq.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $gSq.FillRectangle($bgBrush, 0, 0, $size, $size)
    Draw-Centered $gSq $srcLogo $size $size 0.85
    $sqBmp.Save((Join-Path $folder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bgBrush.Dispose()
    $gSq.Dispose()
    $sqBmp.Dispose()

    # Circular launcher icon
    $roundBmp = New-Object System.Drawing.Bitmap($size, $size)
    $gRd = [System.Drawing.Graphics]::FromImage($roundBmp)
    $gRd.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gRd.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gRd.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gRd.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $clipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $clipPath.AddEllipse(0, 0, $size, $size)
    $gRd.SetClip($clipPath)

    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $gRd.FillRectangle($bgBrush, 0, 0, $size, $size)
    Draw-Centered $gRd $srcLogo $size $size 0.85

    $roundBmp.Save((Join-Path $folder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bgBrush.Dispose()
    $clipPath.Dispose()
    $gRd.Dispose()
    $roundBmp.Dispose()
}

$srcLogo.Dispose()
Write-Host "All Android icons regenerated with UNUmbral green tea branding."
