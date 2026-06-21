import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * MapaLeadsEspana — Mapa coroplético de España por provincias para Astra HQ.
 *
 * Pinta los leads de `panaderias_outbound` agrupados por provincia (derivada de
 * la columna `zona`, que en la tabla son ciudades). Al clicar una provincia se
 * abre un panel con el desglose por estado y las ciudades de esa provincia.
 *
 * Uso:
 *   <MapaLeadsEspana />
 *
 * Requisitos: d3 instalado (npm i d3). El GeoJSON de provincias se carga de un
 * CDN público en runtime, así que no pesa en tu bundle.
 *
 * Mete las credenciales en variables de entorno de tu proyecto Next.js:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (usa la ANON, nunca la service_role en cliente)
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aryognsfjvbywqrhtwim.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// GeoJSON de provincias de España (CDN público).
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

// Normaliza el nombre que viene del GeoJSON para casarlo con nuestras claves.
// Distintos GeoJSON usan grafías diferentes (Vizcaya/Bizkaia, Álava/Araba…).
const ALIAS_PROVINCIA = {
  "Bizkaia": "Vizcaya", "Araba": "Álava", "Araba/Álava": "Álava", "Álava": "Álava",
  "Gipuzkoa": "Guipúzcoa", "A Coruña": "La Coruña", "Ourense": "Orense",
  "Illes Balears": "Baleares", "Islas Baleares": "Baleares",
  "Las Palmas": "Las Palmas", "Santa Cruz de Tenerife": "Santa Cruz de Tenerife",
  "València/Valencia": "Valencia", "Valencia/València": "Valencia",
  "Castelló/Castellón": "Castellón", "Castellón/Castelló": "Castellón",
  "Alacant/Alicante": "Alicante", "Alicante/Alacant": "Alicante",
};

const ESTADOS = [
  { key: "sin_contactar", label: "Sin contactar", color: "#8b93a7" },
  { key: "contactado", label: "Contactado", color: "#3b82f6" },
  { key: "respondio", label: "Respondió", color: "#22c55e" },
  { key: "descartado", label: "Descartado", color: "#ef4444" },
];

function nombreGeo(props) {
  // Probar las claves típicas donde los GeoJSON guardan el nombre.
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
  const [seleccion, setSeleccion] = useState(null); // provincia seleccionada
  const [hover, setHover] = useState(null);

  // 1) Cargar GeoJSON de provincias
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

  // 2) Cargar leads de Supabase
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

  // 3) Agregar leads por provincia
  const porProvincia = useMemo(() => {
    if (!rows) return {};
    const acc = {};
    for (const r of rows) {
      const prov = CIUDAD_PROVINCIA[r.zona];
      if (!prov) continue; // zona sin mapear → no se pinta (revisa el diccionario)
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

  // Escala de color secuencial sobre el verde de marca de Astra (#6FEC7F).
  const color = useMemo(
    () => d3.scaleSequential(d3.interpolate("#10241a", "#6FEC7F")).domain([0, maxTotal]),
    [maxTotal]
  );

  // Tramos para la leyenda
  const tramos = useMemo(() => {
    const t = [];
    const pasos = 5;
    for (let i = 0; i < pasos; i++) {
      const v = Math.round((maxTotal / pasos) * (i + 1));
      t.push({ v, color: color(v) });
    }
    return t;
  }, [maxTotal, color]);

  // 4) Render del mapa con d3
  useEffect(() => {
    if (!geo || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = 760, H = 560;
    const proj = d3.geoMercator().fitSize([W, H], geo);
    const path = d3.geoPath().projection(proj);

    svg
      .append("g")
      .selectAll("path")
      .data(geo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const prov = nombreGeo(d.properties);
        const info = porProvincia[prov];
        return info ? color(info.total) : "#1a2233";
      })
      .attr("stroke", "#0b0f1a")
      .attr("stroke-width", 0.6)
      .attr("cursor", "pointer")
      .on("mousemove", (event, d) => {
        const prov = nombreGeo(d.properties);
        const info = porProvincia[prov];
        setHover({
          x: event.offsetX,
          y: event.offsetY,
          prov,
          total: info ? info.total : 0,
        });
      })
      .on("mouseleave", () => setHover(null))
      .on("click", (_e, d) => {
        const prov = nombreGeo(d.properties);
        setSeleccion({ prov, info: porProvincia[prov] || null });
      })
      .append("title")
      .text((d) => {
        const prov = nombreGeo(d.properties);
        const info = porProvincia[prov];
        return `${prov}: ${info ? info.total : 0} leads`;
      });
  }, [geo, porProvincia, color]);

  const cargando = !geo || !rows;

  return (
    <div style={S.wrap}>
      <header style={S.head}>
        <div>
          <div style={S.eyebrow}>Astra · Outbound panaderías</div>
          <h2 style={S.title}>Leads por provincia</h2>
        </div>
        <div style={S.total}>
          {rows ? rows.length : "—"}
          <span style={S.totalLabel}>leads totales</span>
        </div>
      </header>

      {error && <div style={S.error}>No se pudo cargar: {error}</div>}

      <div style={S.grid}>
        {/* Mapa */}
        <div style={S.mapBox}>
          {cargando && <div style={S.loading}>Cargando mapa…</div>}
          <svg
            ref={svgRef}
            viewBox="0 0 760 560"
            style={{ width: "100%", height: "auto", display: cargando ? "none" : "block" }}
            role="img"
            aria-label="Mapa de leads por provincia"
          />
          {hover && (
            <div style={{ ...S.tip, left: hover.x + 14, top: hover.y + 14 }}>
              <strong>{hover.prov}</strong>
              <br />
              {hover.total} {hover.total === 1 ? "lead" : "leads"}
            </div>
          )}

          {/* Leyenda */}
          <div style={S.legend}>
            <span style={S.legendLabel}>Menos</span>
            {tramos.map((t, i) => (
              <span
                key={i}
                title={`~${t.v}`}
                style={{ ...S.legendChip, background: t.color }}
              />
            ))}
            <span style={S.legendLabel}>Más</span>
          </div>
        </div>

        {/* Panel de detalle */}
        <aside style={S.panel}>
          {!seleccion && (
            <div style={S.empty}>
              Toca una provincia en el mapa para ver el desglose de sus leads.
            </div>
          )}

          {seleccion && (
            <>
              <div style={S.panelHead}>
                <h3 style={S.panelTitle}>{seleccion.prov}</h3>
                <button style={S.close} onClick={() => setSeleccion(null)}>
                  Cerrar
                </button>
              </div>

              {!seleccion.info && (
                <div style={S.empty}>
                  Sin leads en esta provincia todavía.
                </div>
              )}

              {seleccion.info && (
                <>
                  <div style={S.big}>
                    {seleccion.info.total}
                    <span style={S.bigLabel}>leads</span>
                  </div>

                  {/* Barra de estados */}
                  <div style={S.bar}>
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
                      <li key={e.key} style={S.estItem}>
                        <span style={{ ...S.dot, background: e.color }} />
                        <span style={S.estLabel}>{e.label}</span>
                        <span style={S.estNum}>
                          {seleccion.info.estados[e.key] || 0}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div style={S.subhead}>Ciudades</div>
                  <ul style={S.cityList}>
                    {Object.entries(seleccion.info.ciudades)
                      .sort((a, b) => b[1] - a[1])
                      .map(([c, n]) => (
                        <li key={c} style={S.cityItem}>
                          <span>{c}</span>
                          <span style={S.cityNum}>{n}</span>
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

// ── Estilos (objeto inline para que sea pegar-y-listo, sin CSS externo) ───────
const S = {
  wrap: {
    background: "#0b0f1a", color: "#e7ecf3", borderRadius: 18, padding: 24,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif", border: "1px solid #1a2233",
  },
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#6FEC7F", fontWeight: 600 },
  title: { margin: "4px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: -0.5 },
  total: { fontSize: 34, fontWeight: 800, lineHeight: 1, textAlign: "right" },
  totalLabel: { display: "block", fontSize: 11, fontWeight: 500, color: "#8b93a7", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  error: { background: "#2a1212", border: "1px solid #5a1d1d", color: "#fca5a5", padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" },
  mapBox: { position: "relative", background: "#0d1320", borderRadius: 14, padding: 8, border: "1px solid #1a2233" },
  loading: { padding: 60, textAlign: "center", color: "#8b93a7" },
  tip: { position: "absolute", pointerEvents: "none", background: "#0b0f1a", border: "1px solid #2a3650", padding: "6px 10px", borderRadius: 8, fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.5)" },
  legend: { display: "flex", alignItems: "center", gap: 6, padding: "10px 8px 4px", justifyContent: "center" },
  legendChip: { width: 26, height: 12, borderRadius: 2 },
  legendLabel: { fontSize: 11, color: "#8b93a7" },
  panel: { background: "#0d1320", borderRadius: 14, padding: 18, border: "1px solid #1a2233", minHeight: 360 },
  empty: { color: "#8b93a7", fontSize: 14, lineHeight: 1.5, padding: "30px 6px" },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  panelTitle: { margin: 0, fontSize: 20, fontWeight: 700 },
  close: { background: "transparent", border: "1px solid #2a3650", color: "#8b93a7", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" },
  big: { fontSize: 42, fontWeight: 800, lineHeight: 1, marginBottom: 16 },
  bigLabel: { fontSize: 13, fontWeight: 500, color: "#8b93a7", marginLeft: 8 },
  bar: { display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: "#1a2233", marginBottom: 16 },
  estList: { listStyle: "none", margin: 0, padding: 0, marginBottom: 20 },
  estItem: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 14, borderBottom: "1px solid #141b2b" },
  dot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  estLabel: { flex: 1, color: "#c4ccd8" },
  estNum: { fontWeight: 700 },
  subhead: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: "#6FEC7F", fontWeight: 600, marginBottom: 8 },
  cityList: { listStyle: "none", margin: 0, padding: 0 },
  cityItem: { display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0", color: "#c4ccd8", borderBottom: "1px solid #141b2b" },
  cityNum: { fontWeight: 700, color: "#e7ecf3" },
};
