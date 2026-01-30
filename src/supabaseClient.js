import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wrcbwzdetumcdpayofkc.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY2J3emRldHVtY2RwYXlvZmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzYzODEsImV4cCI6MjA2Nzk1MjM4MX0.rNis-laavbueGPtMjD8e7hPqBKq30KJtLLq2vDLNMJA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
