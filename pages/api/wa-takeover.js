import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://aryognsfjvbywqrhtwim.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc");
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { contact_id, bot_activo } = req.body || {};
  if (!contact_id || typeof bot_activo !== "boolean") return res.status(400).json({ error: "Faltan contact_id o bot_activo" });
  try {
    const update = { bot_activo };
    if (!bot_activo) update.takeover_at = new Date().toISOString();
    const { error } = await supabase.from("whatsapp_contacts").update(update).eq("id", contact_id);
    if (error) throw error;
    res.status(200).json({ ok: true, bot_activo });
  } catch (err) { console.error("wa-takeover error:", err); res.status(500).json({ error: err.message }); }
}
