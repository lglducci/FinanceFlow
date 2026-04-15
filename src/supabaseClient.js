import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wrcbwzdetumcdpayofkc.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY2J3emRldHVtY2RwYXlvZmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM3NjM4MSwiZXhwIjoyMDY3OTUyMzgxfQ.fhf0jD-aW9qG98pG3zaeusaQyoyHxx3BBbvEdixvPBk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
