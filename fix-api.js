const fs = require('fs');
let c = fs.readFileSync('pages/api/dashboard.js', 'utf8');

c = c.replace(
  'supabase.from("Leads-Setter-IA").select("*").order("updated_at", { ascending: false }).limit(100),',
  'supabase.from("Leads-Setter-IA").select("*").order("updated_at", { ascending: false }).limit(100),\n      supabase.from("leads_captacion").select("*").order("updated_at", { ascending: false }),'
);

c = c.replace(
  'const [pagos, academy, reuniones, leads, newsletter, chatbot, setter] = await Promise.all([',
  'const [pagos, academy, reuniones, leads, newsletter, chatbot, setter, leadsCaptacion] = await Promise.all(['
);

// Añadir leadsCaptacion al objeto de respuesta
c = c.replace(
  'setter: setter?.data || []',
  'setter: setter?.data || [],\n      leads_captacion: leadsCaptacion?.data || []'
);

fs.writeFileSync('pages/api/dashboard.js', c, 'utf8');
console.log('Done. Tamaño:', c.length);
