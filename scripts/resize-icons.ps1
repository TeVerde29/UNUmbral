Add-Type -AssemblyName System.Drawing

function Resize-Image($srcPath, $destPath, $width, $height) {
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($src, 0, 0, $width, $height)
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $dest.Dispose()
    $src.Dispose()
}

$src = "C:/Users/hikih/.gemini/antigravity/brain/5fee7991-a196-44ae-8c98-6222acc27e31/.user_uploaded/media_1792992898497_4cf0b3da.png"
Resize-Image $src "icon-512.png" 512 512
Resize-Image $src "icon-192.png" 192 192
Resize-Image $src "icon.png" 512 512
Copy-Item $src "logo-original.png" -Force
Write-Host "Icons generated successfully."
