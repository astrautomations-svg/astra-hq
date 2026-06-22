# ============================================================
#  parche_modo_claro_v6.ps1
#  Remata 3 detalles: logo invisible, emoji corrupto, separacion del boton.
#  Backup incluido. Solo retoca.
#     powershell -ExecutionPolicy Bypass -File parche_modo_claro_v6.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"
if (-not (Test-Path $file)) { Write-Host "ERROR: no encuentro pages\index.js." -ForegroundColor Red; exit 1 }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_v6_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

$content = Get-Content $file -Raw -Encoding UTF8

# 1. LOGO: desactivar mixBlendMode en modo claro
if ($content -notmatch "light \.sb img") {
  $logoFix = @"

.light .sb img, .light .sb svg{ mix-blend-mode:normal !important; }
.light [style*="mixBlendMode"]{ mix-blend-mode:normal !important; }
"@
  $ancla = ".light .sb *{ color:var(--t1); }"
  if ($content.Contains($ancla)) {
    $content = $content.Replace($ancla, $ancla + $logoFix)
    Write-Host "1/3 Logo: regla anti mixBlendMode anadida." -ForegroundColor Green
  } else {
    $ancla2 = ".light body{background:#ffffff;}"
    if ($content.Contains($ancla2)) { $content = $content.Replace($ancla2, $ancla2 + $logoFix); Write-Host "1/3 Logo: anadida (fallback)." -ForegroundColor Green }
    else { Write-Host "1/3 AVISO: sin ancla para el logo." -ForegroundColor Yellow }
  }
} else { Write-Host "1/3 Logo: regla ya existia." -ForegroundColor Yellow }

# 2+3. BOTON: reescribir entero (emoji ok + separacion)
# Construimos regex y reemplazo con comillas simples literales.
$pat = '<button onClick=\{toggleTema\}.*?</button>'
$btnRegex = New-Object System.Text.RegularExpressions.Regex($pat)
$btnNuevo = '<button onClick={toggleTema} title="Cambiar modo claro/oscuro" style={{ background:"var(--ink-fill)", border:"1px solid var(--ink-line)", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, marginRight:8 }}>{tema==="light" ? "🌙" : "☀️"}</button>'
if ($btnRegex.IsMatch($content)) {
  $content = $btnRegex.Replace($content, $btnNuevo, 1)
  Write-Host "2/3 Boton reescrito (emoji correcto)." -ForegroundColor Green
  Write-Host "3/3 Separacion ajustada." -ForegroundColor Green
} else {
  Write-Host "AVISO: no encontre el boton de tema." -ForegroundColor Yellow
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO v6. Logo + emoji + separacion." -ForegroundColor Cyan
Write-Host "Restaurar:  copy $backup $file" -ForegroundColor Cyan
Write-Host "Prueba: npm run build  y  npm run start" -ForegroundColor White