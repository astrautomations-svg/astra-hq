# ============================================================
#  aplicar_modo_claro_v4.ps1
#  TODO en uno: modo claro para todo el panel + boton sol/luna ARRIBA en la topbar.
#  - Protege :root y los colores de canvas (no rompe el grafico de fondo).
#  - Convierte blancos/fondos a variables CSS.
#  - Anade :root.light (paleta clara).
#  - Inyecta la logica de modo (localStorage) en el componente principal.
#  - Inserta el boton sol/luna justo antes de la campana en la topbar.
#  Hace backup. No cambia el modo oscuro.
#     powershell -ExecutionPolicy Bypass -File aplicar_modo_claro_v4.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$file = "pages\index.js"
if (-not (Test-Path $file)) { Write-Host "ERROR: no encuentro pages\index.js." -ForegroundColor Red; exit 1 }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = "pages\index.js.backup_clarov4_$stamp"
Copy-Item $file $backup
Write-Host "Backup creado: $backup" -ForegroundColor Green

$content = Get-Content $file -Raw -Encoding UTF8
if ($content -match "root\.light") { Write-Host "El modo claro ya esta aplicado. Salgo." -ForegroundColor Yellow; exit 0 }

# PASO 0 - Proteger colores de canvas
$canvasColors = [ordered]@{ "#020510"="/*__C1__*/"; "#04060e"="/*__C2__*/"; "#020814"="/*__C3__*/" }
foreach ($k in $canvasColors.Keys) { $content = $content.Replace($k, $canvasColors[$k]) }

# PASO 1 - Proteger :root
$rootMatch = [regex]::Match($content, ":root\{[^}]*\}")
if (-not $rootMatch.Success) { Write-Host "ERROR: no encuentro :root{}." -ForegroundColor Red; exit 1 }
$rootOriginal = $rootMatch.Value
$content = $content.Replace($rootOriginal, "/*__ROOT_BLOCK__*/")

# PASO 2 - Convertir blancos
$n = 0
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
foreach ($f in @("#05080f","#080e1c")) { $m = ([regex]::Matches($content, [regex]::Escape($f))).Count; if ($m -gt 0) { $content = $content -replace [regex]::Escape($f), "var(--bg-solid)"; $n += $m } }
Write-Host "Colores convertidos: $n" -ForegroundColor Green

# PASO 3 - Reconstruir :root con vars nuevas
$rootNuevo = $rootOriginal.TrimEnd().TrimEnd("}") + @"
  --ink-1:rgba(255,255,255,0.9); --ink-2:rgba(255,255,255,0.5); --ink-3:rgba(255,255,255,0.28);
  --ink-line:rgba(255,255,255,0.12); --ink-fill:rgba(255,255,255,0.05); --bg-solid:#05080f;
}
"@
$content = $content.Replace("/*__ROOT_BLOCK__*/", $rootNuevo)

# PASO 4 - Restaurar canvas
foreach ($k in $canvasColors.Keys) { $content = $content.Replace($canvasColors[$k], $k) }

# PASO 5 - Bloque :root.light
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
$bodyAnchor = "body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--t1);}"
if ($content.Contains($bodyAnchor)) { $content = $content.Replace($bodyAnchor, $bodyAnchor + $lightBlock) }
else { $content = $content.Replace($rootNuevo, $rootNuevo + $lightBlock) }

# PASO 6 - Inyectar estado + helpers de modo, justo ANTES de "const [notif"
$modeLogic = @"
const [tema, setTema] = useState("dark");
  useEffect(() => {
    let g = "dark";
    try { g = window.localStorage.getItem("astra-modo") || "dark"; } catch(e) {}
    if (g === "light") document.documentElement.classList.add("light"); else document.documentElement.classList.remove("light");
    setTema(g);
  }, []);
  const toggleTema = () => {
    const nv = tema === "dark" ? "light" : "dark";
    if (nv === "light") document.documentElement.classList.add("light"); else document.documentElement.classList.remove("light");
    setTema(nv);
    try { window.localStorage.setItem("astra-modo", nv); } catch(e) {}
  };
"@
$notifAnchor = "const [notif"
$idxNotif = $content.IndexOf($notifAnchor)
if ($idxNotif -lt 0) { Write-Host "ERROR: no encuentro const [notif. Restauro backup." -ForegroundColor Red; Copy-Item $backup $file -Force; exit 1 }
$content = $content.Substring(0,$idxNotif) + $modeLogic + "`r`n  " + $content.Substring($idxNotif)

# PASO 7 - Insertar el boton sol/luna ANTES del boton de la campana
$bellAnchor = "<button onClick={()=>setNotif(!notif)}"
$themeButton = @"
<button onClick={toggleTema} title="Cambiar modo claro/oscuro" style={{ background:"var(--ink-fill)", border:"1px solid var(--ink-line)", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, marginRight:7 }}>{tema==="light" ? "🌙" : "☀️"}</button>
"@
$idxBell = $content.IndexOf($bellAnchor)
if ($idxBell -lt 0) { Write-Host "AVISO: no encontre el boton de la campana. Modo claro aplicado pero SIN boton." -ForegroundColor Yellow }
else { $content = $content.Substring(0,$idxBell) + $themeButton + $content.Substring($idxBell) }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8NoBom)

Write-Host ""
Write-Host "LISTO v4. Modo claro + boton arriba en la topbar." -ForegroundColor Cyan
Write-Host "Restaurar:  copy $backup $file" -ForegroundColor Cyan
Write-Host "Prueba EN LOCAL: npm run build  y luego  npm run start" -ForegroundColor White