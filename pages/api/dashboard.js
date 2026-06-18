import { createClient } from "@supabase/supabase-js";
// Service role key - only used server-side in API routes, never exposed to browser
const supabase = createClient(
  "https://aryognsfjvbywqrhtwim.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "REEMPLAZAR_POR_NUEVA_SERVICE_KEY"
);
export default async function handler(req, res) {
  // Allow CORS from Vercel
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  try {
    const [pagos, academy, reuniones, leads, newsletter, chatbot, setter, leadsCaptacion,
           waContacts, waMessages, waLeadState] = await Promise.all([
      supabase.from("pagos").select("*").order("processed_at", { ascending: false }),
      supabase.from("academy_members").select("*").order("joined_at", { ascending: false }),
      supabase.from("reuniones").select("*").order("start_time", { ascending: false }),
      supabase.from("leads_web").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_suscriptores").select("*"),
      supabase.from("conversaciones_chatbot").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("Leads-Setter-IA").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("leads_captacion").select("*").order("updated_at", { ascending: false }),
      // --- WhatsApp ---
      supabase.from("whatsapp_contacts").select("*").order("last_message_at", { ascending: false }).limit(200),
      supabase.from("whatsapp_messages").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("whatsapp_lead_state").select("*"),
    ]);
    // Log any errors
    [pagos, academy, reuniones, leads, newsletter, chatbot, setter,
     waContacts, waMessages, waLeadState].forEach((r, i) => {
      if (r.error) console.error(`Table ${i} error:`, r.error);
    });
    res.status(200).json({
      pagos:      pagos.data      || [],
      academy:    academy.data    || [],
      reuniones:  reuniones.data  || [],
      leads:      leads.data      || [],
      newsletter: newsletter.data || [],
      chatbot:    chatbot.data    || [],
      setter:     setter.data     || [],
      // WhatsApp
      waContacts:  waContacts.data  || [],
      waMessages:  waMessages.data  || [],
      waLeadState: waLeadState.data || [],
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: err.message });
  }
}
