import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * MapaLeadsEspana — Mapa coroplético de España por provincias para Astra HQ.
 *
 * Fase 1:
 *  - Mapa más grande (la península llena mejor el marco).
 *  - Canarias en su recuadro (inset), no a 1.000 km.
 *  - Soporte de modo claro/oscuro: lee la clase del <html> (light/dark) y un
 *    botón sol/luna que la cambia y guarda la preferencia.
 *
 * Uso:
 *   <MapaLeadsEspana />
 *
 * Requisitos: d3 instalado (npm i d3).
 * Env vars: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (clave anon).
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aryognsfjvbywqrhtwim.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-provinces.geojson";

// ── Mapeo ciudad (zona en la tabla) → provincia (nombre del GeoJSON) ──────────
const CIUDAD_PROVINCIA = {
  Cádiz: "Cádiz", "La Línea": "Cádiz", Sanlúcar: "Cádiz", Algeciras: "Cádiz", Jerez: "Cádiz",
  Jaén: "Jaén", Linares: "Jaén",
  Málaga: "Málaga", "Vélez-Málaga": "Málaga", Marbella: "Málaga",
  Granada: "Granada", Motril: "Granada",
  Almería: "Almería", "El Ejido": "Almería", Roquetas: "Almería",
  Sevilla: "Sevilla", Huelva: "Huelva", Córdoba: "Córdoba",
  Mérida: "Badajoz", "Don Benito": "Badajoz", Badajoz: "Badajoz", Cáceres: "Cáceres",
  Gandía: "Valencia", Valencia: "Valencia",
  "Vila-real": "Castellón", Castellón: "Castellón",
  Elche: "Alicante", Alicante: "Alicante",
  Sabadell: "Barcelona", Terrassa: "Barcelona", Badalona: "Barcelona", Manresa: "Barcelona", Barcelona: "Barcelona",
  Reus: "Tarragona", Tarragona: "Tarragona",
  Girona: "Girona", Lleida: "Lleida",
  Vitoria: "Álava", Getxo: "Vizcaya", Barakaldo: "Vizcaya", Bilbao: "Vizcaya",
  Pamplona: "Navarra", Estella: "Navarra",
  Logroño: "La Rioja",
  Torrelavega: "Cantabria", Santander: "Cantabria",
  Ponferrada: "León", León: "León",
  Lugo: "Lugo", Ourense: "Orense",
  Palencia: "Palencia", Zamora: "Zamora", Ávila: "Ávila", Segovia: "Segovia",
  Cuenca: "Cuenca", Teruel: "Teruel", Madrid: "Madrid",
};

const ALIAS_PROVINCIA = {
  "Bizkaia": "Vizcaya", "Araba": "Álava", "Araba/Álava": "Álava", "Álava": "Álava",
  "Gipuzkoa": "Guipúzcoa", "A Coruña": "La Coruña", "Ourense": "Orense",
  "Illes Balears": "Baleares", "Islas Baleares": "Baleares",
  "Las Palmas": "Las Palmas", "Santa Cruz de Tenerife": "Santa Cruz de Tenerife",
  "València/Valencia": "Valencia", "Valencia/València": "Valencia",
  "Castelló/Castellón": "Castellón", "Castellón/Castelló": "Castellón",
  "Alacant/Alicante": "Alicante", "Alicante/Alacant": "Alicante",
};

// Provincias canarias (para separarlas e insertarlas en su recuadro).
const PROV_CANARIAS = new Set(["Las Palmas", "Santa Cruz de Tenerife"]);

const ESTADOS = [
  { key: "sin_contactar", label: "Sin contactar", color: "#8b93a7" },
  { key: "contactado", label: "Contactado", color: "#3b82f6" },
  { key: "respondio", label: "Respondió", color: "#22c55e" },
  { key: "descartado", label: "Descartado", color: "#ef4444" },
];

function nombreGeo(props) {
  const raw =
    props.name || props.NAME_2 || props.provincia || props.PROVINCIA ||
    props.nombre || props.NAME || "";
  return ALIAS_PROVINCIA[raw] || raw;
}

export default function MapaLeadsEspana() {
  const svgRef = useRef(null);
  const [geo, setGeo] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [seleccion, setSeleccion] = useState(null);
  const [hover, setHover] = useState(null);
  const [modo, setModo] = useState("dark");

  // El control del modo vive en la topbar del panel. Aqui solo OBSERVAMOS
  // la clase del <html> para pintar el mapa en el tono correcto.
  useEffect(() => {
    const sync = () =>
      setModo(document.documentElement.classList.contains("light") ? "light" : "dark");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const claro = modo === "light";
  const T = claro ? TEMA.light : TEMA.dark;

  // 1) GeoJSON
  useEffect(() => {
    let vivo = true;
    fetch(GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar el mapa de provincias");
        return r.json();
      })
      .then((j) => vivo && setGeo(j))
      .catch((e) => vivo && setError(e.message));
    return () => (vivo = false);
  }, []);

  // 2) Leads de Supabase
  useEffect(() => {
    let vivo = true;
    const url =
      `${SUPABASE_URL}/rest/v1/panaderias_outbound` +
      `?select=zona,estado,nombre,telefono,respondio`;
    fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron leer los leads de Supabase");
        return r.json();
      })
      .then((data) => vivo && setRows(Array.isArray(data) ? data : []))
      .catch((e) => vivo && setError(e.message));
    return () => (vivo = false);
  }, []);

  // 3) Agregar por provincia
  const porProvincia = useMemo(() => {
    if (!rows) return {};
    const acc = {};
    for (const r of rows) {
      const prov = CIUDAD_PROVINCIA[r.zona];
      if (!prov) continue;
      if (!acc[prov]) {
        acc[prov] = {
          total: 0,
          estados: { sin_contactar: 0, contactado: 0, respondio: 0, descartado: 0 },
          ciudades: {},
        };
      }
      acc[prov].total += 1;
      const est = r.respondio ? "respondio" : r.estado;
      if (acc[prov].estados[est] != null) acc[prov].estados[est] += 1;
      acc[prov].ciudades[r.zona] = (acc[prov].ciudades[r.zona] || 0) + 1;
    }
    return acc;
  }, [rows]);

  const maxTotal = useMemo(
    () => Math.max(1, ...Object.values(porProvincia).map((p) => p.total)),
    [porProvincia]
  );

  // Escala de color verde Astra. El extremo bajo se adapta al modo.
  const color = useMemo(
    () =>
      d3
        .scaleSequential(d3.interpolate(claro ? "#d6f5dc" : "#10241a", "#6FEC7F"))
        .domain([0, maxTotal]),
    [maxTotal, claro]
  );

  const tramos = useMemo(() => {
    const t = [];
    const pasos = 5;
    for (let i = 0; i < pasos; i++) {
      const v = Math.round((maxTotal / pasos) * (i + 1));
      t.push({ v, color: color(v) });
    }
    return t;
  }, [maxTotal, color]);

  // 4) Render del mapa: península+Baleares grande, Canarias en recuadro.
  useEffect(() => {
    if (!geo || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = 900, H = 660;

    // Separar features: Canarias vs resto.
    const canarias = geo.features.filter((f) => PROV_CANARIAS.has(nombreGeo(f.properties)));
    const peninsula = geo.features.filter((f) => !PROV_CANARIAS.has(nombreGeo(f.properties)));

    const fcPen = { type: "FeatureCollection", features: peninsula };
    const fcCan = { type: "FeatureCollection", features: canarias };

    const pintar = (d) => {
      const prov = nombreGeo(d.properties);
      const info = porProvincia[prov];
      return info ? color(info.total) : T.provVacia;
    };

    const wireEvents = (selection) => {
      selection
        .attr("stroke", T.provBorde)
        .attr("stroke-width", 0.6)
        .attr("cursor", "pointer")
        .on("mousemove", (event, d) => {
          const prov = nombreGeo(d.properties);
          const info = porProvincia[prov];
          setHover({ x: event.offsetX, y: event.offsetY, prov, total: info ? info.total : 0 });
        })
        .on("mouseleave", () => setHover(null))
        .on("click", (_e, d) => {
          const prov = nombreGeo(d.properties);
          setSeleccion({ prov, info: porProvincia[prov] || null });
        });
      selection.append("title").text((d) => {
        const prov = nombreGeo(d.properties);
        const info = porProvincia[prov];
        return `${prov}: ${info ? info.total : 0} leads`;
      });
      return selection;
    };

    // ── Península + Baleares: ocupa casi todo el lienzo ──
    const projPen = d3.geoMercator().fitSize([W, H - 30], fcPen);
    const pathPen = d3.geoPath().projection(projPen);
    wireEvents(
      svg
        .append("g")
        .selectAll("path")
        .data(peninsula)
        .join("path")
        .attr("d", pathPen)
        .attr("fill", (d) => pintar(d))
    );

    // ── Canarias en recuadro abajo-izquierda ──
    if (canarias.length) {
      const boxW = 200, boxH = 96, boxX = 8, boxY = H - boxH - 8;

      svg
        .append("rect")
        .attr("x", boxX)
        .attr("y", boxY)
        .attr("width", boxW)
        .attr("height", boxH)
        .attr("rx", 8)
        .attr("fill", "none")
        .attr("stroke", T.insetBorde)
        .attr("stroke-width", 1);

      svg
        .append("text")
        .attr("x", boxX + 8)
        .attr("y", boxY + 16)
        .attr("fill", T.insetLabel)
        .attr("font-size", 10)
        .attr("font-family", "Inter, system-ui, sans-serif")
        .text("Canarias");

      const projCan = d3
        .geoMercator()
        .fitExtent(
          [
            [boxX + 8, boxY + 22],
            [boxX + boxW - 8, boxY + boxH - 8],
          ],
          fcCan
        );
      const pathCan = d3.geoPath().projection(projCan);

      const gCan = svg
        .append("g")
        .selectAll("path")
        .data(canarias)
        .join("path")
        .attr("d", pathCan)
        .attr("fill", (d) => pintar(d));
      wireEvents(gCan);
    }
  }, [geo, porProvincia, color, T]);

  const cargando = !geo || !rows;

  return (
    <div style={S.wrap(T)}>
      <header style={S.head}>
        <div>
          <div style={S.eyebrow(T)}>Astra · Outbound panaderías</div>
          <h2 style={S.title(T)}>Leads por provincia</h2>
        </div>
        <div style={S.headRight}>
          <div style={S.total(T)}>
            {rows ? rows.length : "—"}
            <span style={S.totalLabel(T)}>leads totales</span>
          </div>
        </div>
      </header>

      {error && <div style={S.error}>No se pudo cargar: {error}</div>}

      <div style={S.grid}>
        <div style={S.mapBox(T)}>
          {cargando && <div style={S.loading(T)}>Cargando mapa…</div>}
          <svg
            ref={svgRef}
            viewBox="0 0 900 660"
            style={{ width: "100%", height: "auto", display: cargando ? "none" : "block" }}
            role="img"
            aria-label="Mapa de leads por provincia"
          />
          {hover && (
            <div style={{ ...S.tip(T), left: hover.x + 14, top: hover.y + 14 }}>
              <strong>{hover.prov}</strong>
              <br />
              {hover.total} {hover.total === 1 ? "lead" : "leads"}
            </div>
          )}

          <div style={S.legend}>
            <span style={S.legendLabel(T)}>Menos</span>
            {tramos.map((t, i) => (
              <span key={i} title={`~${t.v}`} style={{ ...S.legendChip, background: t.color }} />
            ))}
            <span style={S.legendLabel(T)}>Más</span>
          </div>
        </div>

        <aside style={S.panel(T)}>
          {!seleccion && (
            <div style={S.empty(T)}>
              Toca una provincia en el mapa para ver el desglose de sus leads.
            </div>
          )}

          {seleccion && (
            <>
              <div style={S.panelHead}>
                <h3 style={S.panelTitle(T)}>{seleccion.prov}</h3>
                <button style={S.close(T)} onClick={() => setSeleccion(null)}>
                  Cerrar
                </button>
              </div>

              {!seleccion.info && (
                <div style={S.empty(T)}>Sin leads en esta provincia todavía.</div>
              )}

              {seleccion.info && (
                <>
                  <div style={S.big(T)}>
                    {seleccion.info.total}
                    <span style={S.bigLabel(T)}>leads</span>
                  </div>

                  <div style={S.bar(T)}>
                    {ESTADOS.map((e) => {
                      const n = seleccion.info.estados[e.key] || 0;
                      const pct = (n / seleccion.info.total) * 100;
                      if (!n) return null;
                      return (
                        <div
                          key={e.key}
                          title={`${e.label}: ${n}`}
                          style={{ width: `${pct}%`, background: e.color, height: "100%" }}
                        />
                      );
                    })}
                  </div>

                  <ul style={S.estList}>
                    {ESTADOS.map((e) => (
                      <li key={e.key} style={S.estItem(T)}>
                        <span style={{ ...S.dot, background: e.color }} />
                        <span style={S.estLabel(T)}>{e.label}</span>
                        <span style={S.estNum(T)}>{seleccion.info.estados[e.key] || 0}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={S.subhead(T)}>Ciudades</div>
                  <ul style={S.cityList}>
                    {Object.entries(seleccion.info.ciudades)
                      .sort((a, b) => b[1] - a[1])
                      .map(([c, n]) => (
                        <li key={c} style={S.cityItem(T)}>
                          <span>{c}</span>
                          <span style={S.cityNum(T)}>{n}</span>
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

// ── Paletas por modo ──────────────────────────────────────────────────────────
const TEMA = {
  dark: {
    bg: "#0b0f1a", card: "#0d1320", borde: "#1a2233",
    texto: "#e7ecf3", textoSec: "#8b93a7", textoSuave: "#c4ccd8",
    azul: "#38bdf8", verde: "#6FEC7F",
    provVacia: "#1a2233", provBorde: "#0b0f1a",
    insetBorde: "#2a3650", insetLabel: "#8b93a7",
    rowBorde: "#141b2b", tipBg: "#0b0f1a", tipBorde: "#2a3650",
  },
  light: {
    bg: "#ffffff", card: "#f6f8fb", borde: "#e2e8f0",
    texto: "#0b1220", textoSec: "#5b6472", textoSuave: "#1e293b",
    azul: "#0c7ec2", verde: "#2fae46",
    provVacia: "#e6eaf0", provBorde: "#ffffff",
    insetBorde: "#cbd5e1", insetLabel: "#5b6472",
    rowBorde: "#e8edf3", tipBg: "#ffffff", tipBorde: "#cbd5e1",
  },
};

// ── Estilos (funciones que reciben el tema T) ─────────────────────────────────
const S = {
  wrap: (T) => ({
    background: T.bg, color: T.texto, borderRadius: 18, padding: 24,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif", border: `1px solid ${T.borde}`,
  }),
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  headRight: { display: "flex", alignItems: "center", gap: 14 },
  eyebrow: (T) => ({ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: T.verde, fontWeight: 600 }),
  title: (T) => ({ margin: "4px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: T.texto }),
  toggle: (T) => ({
    background: "transparent", border: `1px solid ${T.borde}`, borderRadius: 10,
    width: 38, height: 38, fontSize: 18, cursor: "pointer", lineHeight: 1,
  }),
  total: (T) => ({ fontSize: 34, fontWeight: 800, lineHeight: 1, textAlign: "right", color: T.azul }),
  totalLabel: (T) => ({ display: "block", fontSize: 11, fontWeight: 500, color: T.textoSec, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }),
  error: { background: "#2a1212", border: "1px solid #5a1d1d", color: "#fca5a5", padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start" },
  mapBox: (T) => ({ position: "relative", background: T.card, borderRadius: 14, padding: 8, border: `1px solid ${T.borde}` }),
  loading: (T) => ({ padding: 60, textAlign: "center", color: T.textoSec }),
  tip: (T) => ({ position: "absolute", pointerEvents: "none", background: T.tipBg, color: T.texto, border: `1px solid ${T.tipBorde}`, padding: "6px 10px", borderRadius: 8, fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.35)" }),
  legend: { display: "flex", alignItems: "center", gap: 6, padding: "10px 8px 4px", justifyContent: "center" },
  legendChip: { width: 26, height: 12, borderRadius: 2 },
  legendLabel: (T) => ({ fontSize: 11, color: T.textoSec }),
  panel: (T) => ({ background: T.card, borderRadius: 14, padding: 18, border: `1px solid ${T.borde}`, minHeight: 360 }),
  empty: (T) => ({ color: T.textoSec, fontSize: 14, lineHeight: 1.5, padding: "30px 6px" }),
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  panelTitle: (T) => ({ margin: 0, fontSize: 20, fontWeight: 700, color: T.texto }),
  close: (T) => ({ background: "transparent", border: `1px solid ${T.insetBorde}`, color: T.textoSec, borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }),
  big: (T) => ({ fontSize: 42, fontWeight: 800, lineHeight: 1, marginBottom: 16, color: T.azul }),
  bigLabel: (T) => ({ fontSize: 13, fontWeight: 500, color: T.textoSec, marginLeft: 8 }),
  bar: (T) => ({ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: T.borde, marginBottom: 16 }),
  estList: { listStyle: "none", margin: 0, padding: 0, marginBottom: 20 },
  estItem: (T) => ({ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 14, borderBottom: `1px solid ${T.rowBorde}` }),
  dot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  estLabel: (T) => ({ flex: 1, color: T.textoSuave }),
  estNum: (T) => ({ fontWeight: 700, color: T.texto }),
  subhead: (T) => ({ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: T.verde, fontWeight: 600, marginBottom: 8 }),
  cityList: { listStyle: "none", margin: 0, padding: 0 },
  cityItem: (T) => ({ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0", color: T.textoSuave, borderBottom: `1px solid ${T.rowBorde}` }),
  cityNum: (T) => ({ fontWeight: 700, color: T.texto }),
};
