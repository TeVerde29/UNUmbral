Add-Type -AssemblyName System.Drawing

function Resize-Bitmap($src, $width, $height) {
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($src, 0, 0, $width, $height)
    $graphics.Dispose()
    return $dest
}

function Create-Circular-Bitmap($src, $size) {
    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $graphics.SetClip($path)
    $graphics.DrawImage($src, 0, 0, $size, $size)
    $graphics.ResetClip()
    $path.Dispose()
    $graphics.Dispose()
    return $dest
}

function Create-Monochrome-Icon($size) {
    # Dibujar silueta blanca nítida del té/taza para la barra de notificaciones de Android
    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(2, $size * 0.08))
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Silueta de taza
    $margin = $size * 0.18
    $cupWidth = $size - ($margin * 2)
    $cupHeight = $size * 0.45
    $cupY = $size * 0.42

    # Cuerpo de la taza
    $graphics.FillPie($whiteBrush, $margin, $cupY, $cupWidth, $cupHeight * 1.5, 0, 180)
    # Hojas superiores
    $leaf1 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $leaf1.AddEllipse($size * 0.35, $size * 0.18, $size * 0.28, $size * 0.25)
    $graphics.FillPath($whiteBrush, $leaf1)

    $whiteBrush.Dispose()
    $whitePen.Dispose()
    $graphics.Dispose()
    return $dest
}

$logoPath = "c:/Users/hikih/Documents/Repositorios/app-ricra/logo-original.png"
$srcLogo = [System.Drawing.Bitmap]::FromFile($logoPath)

$mipmapSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

$resBase = "c:/Users/hikih/Documents/Repositorios/app-ricra/android/app/src/main/res"

foreach ($entry in $mipmapSizes.GetEnumerator()) {
    $folder = Join-Path $resBase $entry.Key
    if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder | Out-Null }
    $size = $entry.Value
    
    # Square launcher
    $square = Resize-Bitmap $srcLogo $size $size
    $square.Save((Join-Path $folder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $square.Dispose()

    # Round launcher
    $round = Create-Circular-Bitmap $srcLogo $size
    $round.Save((Join-Path $folder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $round.Dispose()
}

# Iconos monocromáticos para notificaciones (ic_stat_icon.png)
$drawableSizes = @{
    "drawable" = 48
    "drawable-mdpi" = 24
    "drawable-hdpi" = 36
    "drawable-xhdpi" = 48
    "drawable-xxhdpi" = 72
    "drawable-xxxhdpi" = 96
}

foreach ($entry in $drawableSizes.GetEnumerator()) {
    $folder = Join-Path $resBase $entry.Key
    if (-not (Test-Path $folder)) { New-Item -ItemType Directory -Path $folder | Out-Null }
    $size = $entry.Value
    $notifBmp = Create-Monochrome-Icon $size
    $notifBmp.Save((Join-Path $folder "ic_stat_icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $notifBmp.Dispose()
}

$srcLogo.Dispose()
Write-Host "Android icons and notification drawables generated successfully."
