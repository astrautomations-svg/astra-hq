const fs = require('fs');
const file = 'pages/index.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace DashboardView signature to destructure realData properly
const oldSignature = 'function DashboardView({ realData }) {';
const newSignature = `function DashboardView({ realData }) {
  // --- Computed from realData ---
  const pagos = (realData && realData.pagos) || [];
  const academy = (realData && realData.academy) || [];
  const reuniones = (realData && realData.reuniones) || [];
  const leads = (realData && realData.leads) || [];

  // revData: ingresos mensuales reales (últimos 12 meses)
  const byMonth = {};
  pagos.forEach(p => {
    if (!p.processed_at) return;
    const d = new Date(p.processed_at);
    const key = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    byMonth[key] = byMonth[key] || { s: 0, p: 0 };
    if (p.is_academy) byMonth[key].p += Number(p.amount || 0);
    else byMonth[key].s += Number(p.amount || 0);
  });
  const computedRevData = Object.entries(byMonth).slice(-12).map(([m, v]) => ({ m, s: v.s, p: v.p }));
  const chartRevData = computedRevData.length > 0 ? computedRevData : revData;

  // funnelData: leads por estado
  const estadoMap = {};
  leads.forEach(l => {
    const e = l.estado || 'nuevo';
    estadoMap[e] = (estadoMap[e] || 0) + 1;
  });
  const stageOrder = ['nuevo', 'contactado', 'respondio', 'reunion', 'propuesta', 'cliente'];
  const stageLabels = { nuevo: 'Prospectos', contactado: 'Contactados', respondio: 'Respondieron', reunion: 'Reunión', propuesta: 'Propuesta', cliente: 'Clientes' };
  const computedFunnelData = stageOrder
    .filter(s => estadoMap[s])
    .map(s => ({ n: stageLabels[s] || s, v: estadoMap[s] }));
  const chartFunnelData = computedFunnelData.length > 0 ? computedFunnelData : funnelData;
  const funnelMax = chartFunnelData[0]?.v || 1;

  // activity: últimos eventos reales
  const fmtAgo = d => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return min + 'min';
    const h = Math.floor(min / 60);
    if (h < 24) return h + 'h';
    return Math.floor(h / 24) + 'd';
  };
  const computedActivity = [
    ...pagos.slice(0, 3).map(p => ({
      ico: 'dollar', txt: (p.customer_name || p.customer_email || 'Pago') + ' — pago recibido',
      val: '€' + Number(p.amount || 0).toLocaleString('es-ES'), t: fmtAgo(p.processed_at || p.created_at), c: '#34d399'
    })),
    ...reuniones.filter(r => r.status === 'programada').slice(0, 2).map(r => ({
      ico: 'capture', txt: 'Reunión con ' + (r.guest_name || r.guest_email || 'invitado'),
      val: r.event_name || 'Reunión', t: fmtAgo(r.created_at), c: '#fbbf24'
    })),
    ...academy.slice(0, 2).map(m => ({
      ico: 'academy', txt: (m.display_name || m.email || 'Miembro') + ' — Astra Academy',
      val: '+€' + (m.plan_name === 'Pro' ? '497' : '297'), t: fmtAgo(m.joined_at || m.created_at), c: '#a78bfa'
    })),
  ].slice(0, 6);
  const chartActivity = computedActivity.length > 0 ? computedActivity : activity;
`;

content = content.replace(oldSignature, newSignature);

// 2. Replace revData usage in the chart with chartRevData
content = content.replace('<AreaChart data={revData}>', '<AreaChart data={chartRevData}>');

// 3. Replace funnelData.map with chartFunnelData.map and fix max
content = content.replace(
  '{funnelData.map((d,i)=>{',
  '{chartFunnelData.map((d,i)=>{'
);
content = content.replace(
  'const pct=Math.round((d.v/840)*100);',
  'const pct=Math.round((d.v/funnelMax)*100);'
);

// 4. Replace activity.map with chartActivity.map
content = content.replace(
  '{activity.map((a,i)=>(',
  '{chartActivity.map((a,i)=>('
);
content = content.replace(
  'i<activity.length-1',
  'i<chartActivity.length-1'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done. File size:', content.length);
