import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://aryognsfjvbywqrhtwim.supabase.co",
  process.env.SUPABASE_SERVICE_KEY || "REEMPLAZAR_POR_NUEVA_SERVICE_KEY"
);
// Webhook de n8n que recibe {to, text} y envía por WhatsApp con la credencial que ya funciona
const N8N_SEND_WEBHOOK = process.env.N8N_WA_SEND_WEBHOOK || "https://TU-N8N/webhook/wa-send-manual";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { contact_id, wa_id, text } = req.body || {};
  if (!wa_id || !text) return res.status(400).json({ error: "Faltan wa_id o text" });
  try {
    // 1. Enviar por n8n
    const r = await fetch(N8N_SEND_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: wa_id, text }),
    });
    if (!r.ok) throw new Error("n8n webhook respondió " + r.status);
    // 2. Guardar el mensaje saliente en Supabase (para que aparezca en el hilo)
    if (contact_id) {
      await supabase.from("whatsapp_messages").insert({
        contact_id, direction: "outbound", message_type: "text",
        body: text, status: "sent",
      });
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("wa-send error:", err);
    res.status(500).json({ error: err.message });
  }
}
