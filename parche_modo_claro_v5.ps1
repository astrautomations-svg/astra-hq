# ============================================================
#  parche_modo_claro_v5.ps1
#  Remata el modo claro:
#   1. Fuerza el fondo claro de la sidebar (.sb) y la topbar (.tb) en modo claro.
#   2. Arregla el emoji del boton sol/luna si se corrompio.
#  Hace backup. Solo anade reglas, no reconvierte colores.
#     powershell -ExecutionPolicy Bypass -File parche_modo_claro_v5.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"
if (-not (Test-Path $file)) { Write-Host "ERROR: no encuentro pages\index.js." -ForegroundColor Red; exit 1 }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_v5_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

# Leer como UTF8 para manejar bien los emojis
$content = Get-Content $file -Raw -Encoding UTF8

# ============================================================
# 1. ANADIR reglas para sidebar y topbar en modo claro
#    Se insertan dentro/justo despues del bloque :root.light
# ============================================================
if ($content -match "\.light \.sb\{") {
  Write-Host "Las reglas de sidebar/topbar claras ya existen. Salto." -ForegroundColor Yellow
} else {
  $reglas = @"

.light .sb{ background:#f6f8fb !important; border-right:1px solid rgba(15,23,42,0.08) !important; }
.light .tb{ background:rgba(255,255,255,0.85) !important; border-bottom:1px solid rgba(15,23,42,0.08) !important; }
.light .sb *{ color:var(--t1); }
"@
  # Anclar tras la linea ".light body{background:#ffffff;}" que metio el v4
  $ancla = ".light body{background:#ffffff;}"
  if ($content.Contains($ancla)) {
    $content = $content.Replace($ancla, $ancla + $reglas)
    Write-Host "Reglas de sidebar/topbar claras anadidas." -ForegroundColor Green
  } else {
    Write-Host "AVISO: no encontre la ancla .light body. No se anadieron las reglas." -ForegroundColor Yellow
  }
}

# ============================================================
# 2. ARREGLAR el emoji del boton (por si se corrompio al guardar)
#    Reescribimos el contenido del boton de tema con los emojis correctos.
# ============================================================
# Buscar el boton de tema por su onClick unico y reemplazar el bloque del emoji.
# Patron: >{tema==="light" ? "ALGO" : "ALGO"}</button>
$content = [regex]::Replace($content, '>\{tema==="light" \? "[^"]*" : "[^"]*"\}</button>', '>{tema==="light" ? "🌙" : "☀️"}</button>')

# Guardar UTF8 SIN BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO v5. Sidebar/topbar claras + emoji arreglado." -ForegroundColor Cyan
Write-Host "Restaurar:  copy $backup $file" -ForegroundColor Cyan
Write-Host "Prueba: npm run build  y  npm run start" -ForegroundColor White