import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if values exist
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Anon Key is missing. Check your .env file!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
