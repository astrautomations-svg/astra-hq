import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aryognsfjvbywqrhtwim.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1NDc3MiwiZXhwIjoyMDk1MDMwNzcyfQ.FfC3yf3SK9_dAIfwUMDnx0P9Jw_654BGU17NSiXAakc"
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // CREAR cliente
  if (req.method === "POST") {
    try {
      const b = req.body || {};
      if (!b.company_name && !b.name) {
        return res.status(400).json({ error: "Falta el nombre de la empresa" });
      }
      const { data, error } = await supabase.from("clients").insert({
        name: b.name || b.company_name || "",
        company_name: b.company_name || b.name || "",
        contact_name: b.contact_name || "",
        phone_e164: b.phone_e164 || "",
        email: b.email || "",
        status: b.status || "activo",
        client_type: b.client_type || "",
        source: b.source || "manual",
        responsible_internal: b.responsible_internal || "",
        notes: b.notes || "",
        photo_url: b.photo_url || "",
      }).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // EDITAR cliente
  if (req.method === "PATCH") {
    try {
      const b = req.body || {};
      if (!b.id) return res.status(400).json({ error: "Falta el id del cliente" });
      const fields = {};
      ["name","company_name","contact_name","phone_e164","email","status","client_type","responsible_internal","notes","photo_url"].forEach(k => {
        if (b[k] !== undefined) fields[k] = b[k];
      });
      fields.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from("clients").update(fields).eq("id", b.id).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // SUBIR foto (base64 -> Storage)
  if (req.method === "PUT") {
    try {
      const b = req.body || {};
      if (!b.fileBase64 || !b.fileName) return res.status(400).json({ error: "Falta el archivo" });
      const buffer = Buffer.from(b.fileBase64.split(",").pop(), "base64");
      const ext = (b.fileName.split(".").pop() || "jpg").toLowerCase();
      const path = `client-${b.clientId || Date.now()}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("client-photos").upload(path, buffer, {
        contentType: b.contentType || "image/jpeg",
        upsert: true,
      });
      if (upErr) return res.status(500).json({ error: upErr.message });
      const { data: pub } = supabase.storage.from("client-photos").getPublicUrl(path);
      return res.status(200).json({ ok: true, url: pub.publicUrl });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
