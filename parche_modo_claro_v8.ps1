# ============================================================
#  parche_modo_claro_v8.ps1
#  Arregla el LOGO de Astra en modo claro.
#  El selector del v6 buscaba "mixBlendMode" (camelCase) pero React
#  serializa el style inline como "mix-blend-mode" (con guiones).
#  Por eso la regla no aplicaba. Lo corregimos.
#     powershell -ExecutionPolicy Bypass -File parche_modo_claro_v8.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"
if (-not (Test-Path $file)) { Write-Host "ERROR: no encuentro pages\index.js." -ForegroundColor Red; exit 1 }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_v8_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

$content = Get-Content $file -Raw -Encoding UTF8

# Reemplazar el selector roto (camelCase) por el correcto (con guiones).
$viejo = '.light [style*="mixBlendMode"]{ mix-blend-mode:normal !important; }'
$nuevo = '.light [style*="mix-blend-mode"]{ mix-blend-mode:normal !important; }'
if ($content.Contains($viejo)) {
  $content = $content.Replace($viejo, $nuevo)
  Write-Host "Selector del logo corregido (mix-blend-mode con guiones)." -ForegroundColor Green
} else {
  Write-Host "AVISO: no encontre el selector viejo. Quiza ya estaba corregido." -ForegroundColor Yellow
}

# Refuerzo: regla mas especifica que pega directo al contenedor del logo de la sidebar.
# .light .sb > div:first-child cubre el header con el logo.
if ($content -notmatch "light \.sb > div:first-child") {
  $refuerzo = @"

.light .sb > div:first-child > div{ mix-blend-mode:normal !important; }
"@
  $ancla = '.light [style*="mix-blend-mode"]{ mix-blend-mode:normal !important; }'
  if ($content.Contains($ancla)) {
    $content = $content.Replace($ancla, $ancla + $refuerzo)
    Write-Host "Regla de refuerzo del logo anadida." -ForegroundColor Green
  }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO v8. Logo visible en modo claro." -ForegroundColor Cyan
Write-Host "Restaurar:  copy $backup $file" -ForegroundColor Cyan
Write-Host "Prueba: npm run build  y  npm run start" -ForegroundColor White