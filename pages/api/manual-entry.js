import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://aryognsfjvbywqrhtwim.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  try {
    const { customer_name, amount, plan_name, currency, status, is_academy, event_type, processed_at } = req.body;
    
    if (!customer_name || amount === undefined) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const { data, error } = await supabase.from("pagos").insert({
      customer_name,
      customer_email: "",
      amount: Number(amount),
      currency: currency || "EUR",
      plan_name: plan_name || "Manual",
      status: status || "succeeded",
      is_academy: is_academy || false,
      event_type: event_type || "manual_entry",
      processed_at: processed_at || new Date().toISOString(),
    }).select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
