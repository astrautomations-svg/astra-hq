import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://aryognsfjvbywqrhtwim.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc");
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const { data, error } = await supabase.from("panaderias_outbound").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.status(200).json({ panaderias: data || [] });
  } catch (err) { console.error("panaderias API error:", err); res.status(500).json({ error: err.message }); }
}
