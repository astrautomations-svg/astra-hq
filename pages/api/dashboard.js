import { createClient } from "@supabase/supabase-js";

// Service role key - only used server-side in API routes, never exposed to browser
const supabase = createClient(
  "https://aryognsfjvbywqrhtwim.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc"
);

export default async function handler(req, res) {
  // Allow CORS from Vercel
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  
  try {
    const [pagos, academy, reuniones, leads, newsletter, chatbot, setter, leadsCaptacion] = await Promise.all([
      supabase.from("pagos").select("*").order("processed_at", { ascending: false }),
      supabase.from("academy_members").select("*").order("joined_at", { ascending: false }),
      supabase.from("reuniones").select("*").order("start_time", { ascending: false }),
      supabase.from("leads_web").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_suscriptores").select("*"),
      supabase.from("conversaciones_chatbot").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("Leads-Setter-IA").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("leads_captacion").select("*").order("updated_at", { ascending: false }),
    ]);

    // Log any errors
    [pagos, academy, reuniones, leads, newsletter, chatbot, setter].forEach((r, i) => {
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
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: err.message });
  }
}
