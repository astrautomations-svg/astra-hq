import { createClient } from "@supabase/supabase-js";
// Service role key - only used server-side in API routes, never exposed to browser
const supabase = createClient(
  "https://aryognsfjvbywqrhtwim.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc"
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { contact_id } = req.query;
  if (!contact_id) {
    return res.status(400).json({ error: "Falta el parametro contact_id" });
  }

  try {
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("contact_id", contact_id)
      .order("created_at", { ascending: true })
      .limit(1000); // limite por conversacion individual, no global

    if (error) {
      console.error("wa-messages error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ messages: data || [] });
  } catch (err) {
    console.error("wa-messages API error:", err);
    res.status(500).json({ error: err.message });
  }
}
