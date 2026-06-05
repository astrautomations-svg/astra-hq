import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aryognsfjvbywqrhtwim.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeW9nbnNmanZieXdxcmh0d2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTQ3NzIsImV4cCI6MjA5NTAzMDc3Mn0.1Bofv7hY2u9QBJ0BwU1efoHWud6c2Mn8oLODJw8ubYY";

export const supabase = createClient(supabaseUrl, supabaseKey);
