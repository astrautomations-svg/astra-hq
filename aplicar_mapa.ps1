# ============================================================
#  aplicar_mapa.ps1
#  Inserta el componente MapaLeadsEspana en pages/index.js
#  - Anade el import
#  - Inserta <MapaLeadsEspana /> dentro de AnalyticsView
#  Hace backup antes de tocar nada. No modifica nada mas.
#  Ejecutar desde la carpeta del proyecto (astra-hq):
#     powershell -ExecutionPolicy Bypass -File aplicar_mapa.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"

if (-not (Test-Path $file)) {
    Write-Host "ERROR: no encuentro pages\index.js. Ejecuta el script desde la carpeta astra-hq." -ForegroundColor Red
    exit 1
}

# --- Backup con marca de tiempo ---
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_mapa_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

# --- Leer el archivo entero (UTF8) ---
$content = Get-Content $file -Raw -Encoding UTF8

# ============================================================
# CAMBIO 1 - IMPORT
# ============================================================
$importLine = 'import MapaLeadsEspana from "../components/MapaLeadsEspana";'

if ($content -match [regex]::Escape($importLine)) {
    Write-Host "El import ya estaba puesto. Lo salto." -ForegroundColor Yellow
} else {
    $anchorImport = 'import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";'
    if ($content -match [regex]::Escape($anchorImport)) {
        $content = $content -replace [regex]::Escape($anchorImport), "$anchorImport`r`n$importLine"
        Write-Host "Cambio 1 OK: import anadido." -ForegroundColor Green
    } else {
        Write-Host "ERROR: no encuentro la linea de import de Clerk. No toco nada." -ForegroundColor Red
        exit 1
    }
}

# ============================================================
# CAMBIO 2 - INSERTAR EL MAPA EN AnalyticsView
# ============================================================
$mapaBloque = @"
      <div style={{ marginBottom: 16 }}>
        <MapaLeadsEspana />
      </div>
"@

if ($content -match 'MapaLeadsEspana\s*/>') {
    Write-Host "El <MapaLeadsEspana /> ya estaba en el render. Lo salto." -ForegroundColor Yellow
} else {
    # El SHead de Analytics es unico por su atributo sub
    $anchorHead = '<SHead title="Analytics" sub="Calculado desde datos reales de Supabase"/>'
    if ($content -match [regex]::Escape($anchorHead)) {
        $content = $content -replace [regex]::Escape($anchorHead), "$anchorHead`r`n$mapaBloque"
        Write-Host "Cambio 2 OK: <MapaLeadsEspana /> insertado en Analytics." -ForegroundColor Green
    } else {
        Write-Host "ERROR: no encuentro el SHead de Analytics. Revertir con el backup si hace falta." -ForegroundColor Red
        exit 1
    }
}

# --- Guardar (UTF8 sin BOM) ---
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO. Cambios aplicados sobre $file" -ForegroundColor Cyan
Write-Host "Si algo va mal, restaura con:  copy $backup $file" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta:  npm run dev" -ForegroundColor White
