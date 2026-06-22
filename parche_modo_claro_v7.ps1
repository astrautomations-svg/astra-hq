# ============================================================
#  parche_modo_claro_v7.ps1
#  Arregla el emoji DEFINITIVAMENTE usando codigos (no caracteres).
#  Reescribe el boton de tema entero. Backup incluido.
#     powershell -ExecutionPolicy Bypass -File parche_modo_claro_v7.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"
if (-not (Test-Path $file)) { Write-Host "ERROR: no encuentro pages\index.js." -ForegroundColor Red; exit 1 }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_v7_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

$content = Get-Content $file -Raw -Encoding UTF8

# Reescribir el boton de tema entero. El emoji va como String.fromCodePoint (ASCII puro).
$pat = '<button onClick=\{toggleTema\}.*?</button>'
$btnRegex = New-Object System.Text.RegularExpressions.Regex($pat)
$btnNuevo = '<button onClick={toggleTema} title="Cambiar modo claro/oscuro" style={{ background:"var(--ink-fill)", border:"1px solid var(--ink-line)", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, marginRight:8 }}>{tema==="light" ? String.fromCodePoint(0x1F319) : String.fromCodePoint(0x2600,0xFE0F)}</button>'
if ($btnRegex.IsMatch($content)) {
  $content = $btnRegex.Replace($content, $btnNuevo, 1)
  Write-Host "Boton reescrito con emoji por codigo (a prueba de encoding)." -ForegroundColor Green
} else {
  Write-Host "AVISO: no encontre el boton de tema. Nada cambiado." -ForegroundColor Yellow
  exit 1
}

# Guardar como UTF-8 sin BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO v7. Emoji arreglado de raiz." -ForegroundColor Cyan
Write-Host "Restaurar:  copy $backup $file" -ForegroundColor Cyan
Write-Host "Prueba: npm run build  y  npm run start" -ForegroundColor White