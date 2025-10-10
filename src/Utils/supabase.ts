import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

// Debug logging for production
console.log("Supabase Config:", {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "MISSING",
  key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : "MISSING",
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  environment: import.meta.env.MODE,
  fullUrl: supabaseUrl
});

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_API_KEY:", supabaseKey);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
