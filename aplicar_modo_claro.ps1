# ============================================================
#  aplicar_modo_claro.ps1
#  Convierte los blancos a fuego del panel en variables CSS y anade
#  el bloque :root.light. Hace backup. No cambia el modo oscuro.
#  CLAVE: NO toca el interior del bloque :root{...} (alli se DEFINEN
#  las variables; tocarlo romperia la cascada).
#  Ejecutar desde astra-hq:
#     powershell -ExecutionPolicy Bypass -File aplicar_modo_claro.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"

if (-not (Test-Path $file)) {
    Write-Host "ERROR: no encuentro pages\index.js. Ejecuta desde astra-hq." -ForegroundColor Red
    exit 1
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_claro_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

$content = Get-Content $file -Raw -Encoding UTF8

if ($content -match "root\.light") {
    Write-Host "El modo claro ya esta aplicado. Salgo sin tocar nada." -ForegroundColor Yellow
    exit 0
}

# ============================================================
# PASO 1 - Aislar el bloque :root{...} para NO tocarlo
# ============================================================
$rootMatch = [regex]::Match($content, ":root\{[^}]*\}")
if (-not $rootMatch.Success) {
    Write-Host "ERROR: no encuentro el bloque :root{}. Abortando." -ForegroundColor Red
    exit 1
}
$rootOriginal = $rootMatch.Value
$PLACEHOLDER = "/*__ROOT_BLOCK__*/"
# Sustituir temporalmente el :root por un marcador para protegerlo
$content = $content.Replace($rootOriginal, $PLACEHOLDER)

$n = 0

# ============================================================
# PASO 2 - Convertir blancos a fuego (fuera de :root) en variables
# ============================================================
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.93\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.93\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.92\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.92\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.9\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.9\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.88\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.88\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.85\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.85\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.82\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.82\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.8\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.8\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.76\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.76\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.74\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.74\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.7\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.7\)", "var(--ink-1)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.65\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.65\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.6\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.6\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.55\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.55\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.52\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.52\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.5\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.5\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.46\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.46\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.45\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.45\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.44\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.44\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.42\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.42\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.4\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.4\)", "var(--ink-2)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.36\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.36\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.35\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.35\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.32\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.32\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.3\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.3\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.28\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.28\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.27\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.27\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.26\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.26\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.25\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.25\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.24\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.24\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.22\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.22\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.2\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.2\)", "var(--ink-3)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.19\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.19\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.18\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.18\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.16\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.16\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.14\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.14\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.12\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.12\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.11\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.11\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.1\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.1\)", "var(--ink-line)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.09\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.09\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.08\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.08\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.07\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.07\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.068\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.068\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.064\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.064\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.06\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.06\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.055\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.055\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.052\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.052\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.05\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.05\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.044\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.044\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.04\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.04\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.038\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.038\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.036\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.036\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.034\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.034\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.032\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.032\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.03\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.03\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.026\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.026\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.024\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.024\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.02\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.02\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.016\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.016\)", "var(--ink-fill)"; $n += $m }
$m = ([regex]::Matches($content, "rgba\(255,255,255,0\.008\)")).Count; if ($m -gt 0) { $content = $content -replace "rgba\(255,255,255,0\.008\)", "var(--ink-fill)"; $n += $m }

# Fondos oscuros solidos -> variable de fondo
$m = ([regex]::Matches($content, "#05080f")).Count; if ($m -gt 0) { $content = $content -replace "#05080f", "var(--bg-solid)"; $n += $m }
$m = ([regex]::Matches($content, "#080e1c")).Count; if ($m -gt 0) { $content = $content -replace "#080e1c", "var(--bg-solid)"; $n += $m }
$m = ([regex]::Matches($content, "#04060e")).Count; if ($m -gt 0) { $content = $content -replace "#04060e", "var(--bg-solid)"; $n += $m }
$m = ([regex]::Matches($content, "#020510")).Count; if ($m -gt 0) { $content = $content -replace "#020510", "var(--bg-solid)"; $n += $m }
$m = ([regex]::Matches($content, "#020814")).Count; if ($m -gt 0) { $content = $content -replace "#020814", "var(--bg-solid)"; $n += $m }
# rgba(4,6,14,*), rgba(0,0,0,*) se dejan: sombras/overlays validos en ambos modos.

Write-Host "Colores convertidos a variables: $n" -ForegroundColor Green

# ============================================================
# PASO 3 - Reconstruir el :root con las variables nuevas anadidas
# ============================================================
# Quitamos el cierre } del root original para anadir las vars ink/bg-solid
$rootSinCierre = $rootOriginal.TrimEnd().TrimEnd("}")
$rootNuevo = $rootSinCierre + @"
  --ink-1:rgba(255,255,255,0.9); --ink-2:rgba(255,255,255,0.5); --ink-3:rgba(255,255,255,0.28);
  --ink-line:rgba(255,255,255,0.12); --ink-fill:rgba(255,255,255,0.05); --bg-solid:#05080f;
}
"@

# Restaurar el marcador con el :root nuevo
$content = $content.Replace($PLACEHOLDER, $rootNuevo)

# ============================================================
# PASO 4 - Anadir el bloque :root.light
# ============================================================
$lightBlock = @"

:root.light{
  --bg:#ffffff; --bg2:#f6f8fb; --bg-solid:#ffffff;
  --gb:rgba(15,23,42,0.03); --gbh:rgba(15,23,42,0.05);
  --bdr:rgba(15,23,42,0.1); --bdrh:rgba(15,23,42,0.18);
  --shine:rgba(15,23,42,0.06);
  --t1:rgba(11,18,32,0.92); --t2:rgba(11,18,32,0.55);
  --t3:rgba(11,18,32,0.3); --t4:rgba(11,18,32,0.1);
  --ink-1:rgba(11,18,32,0.92); --ink-2:rgba(11,18,32,0.55); --ink-3:rgba(11,18,32,0.32);
  --ink-line:rgba(11,18,32,0.14); --ink-fill:rgba(11,18,32,0.04);
  --blue:#0c7ec2; --indigo:#5b54d6; --green:#1f9d57;
  --amber:#b5790a; --red:#dc4444; --purple:#7c5fd3;
}
.light body{background:#ffffff;}
"@

# Insertar el bloque light justo despues de la linea body{...} que sigue a :root
$bodyAnchor = "body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--t1);}"
if ($content.Contains($bodyAnchor)) {
    $content = $content.Replace($bodyAnchor, $bodyAnchor + $lightBlock)
} else {
    Write-Host "AVISO: no encontre la linea body para anclar el bloque light. Lo anado tras el :root." -ForegroundColor Yellow
    $content = $content.Replace($rootNuevo, $rootNuevo + $lightBlock)
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO. Modo claro aplicado." -ForegroundColor Cyan
Write-Host "Restaurar si hace falta:  copy $backup $file" -ForegroundColor Cyan
Write-Host "Ahora: npm run dev y pulsa el sol/luna del mapa." -ForegroundColor White