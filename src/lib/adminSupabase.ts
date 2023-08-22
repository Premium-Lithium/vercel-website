import { SUPABASE_SERVICE_KEY } from "$env/static/private";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL } from "$env/static/public";

export const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
})