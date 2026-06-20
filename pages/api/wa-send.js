import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://aryognsfjvbywqrhtwim.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc");
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { contact_id, wa_id, text } = req.body || {};
  if (!contact_id || !wa_id || !text) return res.status(400).json({ error: "Faltan datos" });
  const webhook = process.env.N8N_WA_SEND_WEBHOOK;
  try {
    if (webhook) {
      await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wa_id, text }) });
    }
    await supabase.from("whatsapp_messages").insert({ contact_id, direction: "outbound", body: text, message_type: "text", is_manual: true, created_at: new Date().toISOString() });
    res.status(200).json({ ok: true, sent: !!webhook });
  } catch (err) { console.error("wa-send error:", err); res.status(500).json({ error: err.message }); }
}
