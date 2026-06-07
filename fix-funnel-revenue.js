const fs = require('fs');
const file = 'pages/index.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Añadir leads_captacion al fetch de la API de dashboard
// Busca el endpoint /api/dashboard y añade leads_captacion a las tablas que trae
const oldApiRoute = "const tables = ['pagos','reuniones','academy_members','leads_web','newsletter_suscriptores','conversaciones_chatbot','config','astra_discord_memory','messages','conversations']";
const newApiRoute = "const tables = ['pagos','reuniones','academy_members','leads_web','leads_captacion','newsletter_suscriptores','conversaciones_chatbot','config','astra_discord_memory','messages','conversations']";

if (content.includes(oldApiRoute)) {
  content = content.replace(oldApiRoute, newApiRoute);
  console.log('✅ API route actualizada');
} else {
  console.log('⚠️  No encontré el array de tablas exacto — revisa manualmente pages/api/dashboard.js');
}

// 2. Actualizar DashboardView para usar leads_captacion en el funnel
const oldLeads = "const leads = (realData && realData.leads) || [];";
const newLeads = `const leads = (realData && realData.leads) || [];
  const leadsCaptacion = (realData && realData.leads_captacion) || [];`;

content = content.replace(oldLeads, newLeads);

// 3. Reemplazar el cálculo del funnel para usar leads_captacion
const oldFunnel = `  // funnelData: leads por estado
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
  const funnelMax = chartFunnelData[0]?.v || 1;`;

const newFunnel = `  // funnelData: desde leads_captacion en Supabase
  const funnelSource = leadsCaptacion.length > 0 ? leadsCaptacion : leads;
  const totalProspectos = funnelSource.length;
  const totalContactados = funnelSource.filter(l => l.primer_contacto || l.estado === 'contactado' || l.estado === 'follow_up' || l.estado === 'loom_enviado' || l.estado === 'follow_up_loom').length;
  const totalRespondieron = funnelSource.filter(l => l.respondio || l.loom_enviado || l.estado === 'loom_enviado' || l.estado === 'follow_up_loom').length;
  const totalReunion = (realData && realData.reuniones) ? realData.reuniones.length : 0;
  const totalPropuesta = 0; // actualizar cuando haya dato
  const totalClientes = (realData && realData.academy_members) ? realData.academy_members.length : 0;

  const computedFunnelData = [
    { n: 'Prospectos',   v: totalProspectos   || funnelData[0].v },
    { n: 'Contactados',  v: totalContactados  || funnelData[1].v },
    { n: 'Respondieron', v: totalRespondieron || funnelData[2].v },
    { n: 'Reunión',      v: totalReunion      || funnelData[3].v },
    { n: 'Propuesta',    v: totalPropuesta    || funnelData[4].v },
    { n: 'Clientes',     v: totalClientes     || funnelData[5].v },
  ].filter(d => d.v > 0);
  const chartFunnelData = computedFunnelData.length > 0 ? computedFunnelData : funnelData;
  const funnelMax = chartFunnelData[0]?.v || 1;`;

if (content.includes(oldFunnel)) {
  content = content.replace(oldFunnel, newFunnel);
  console.log('✅ Funnel actualizado');
} else {
  console.log('⚠️  No encontré el bloque del funnel exacto');
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Done. Tamaño:', content.length);
