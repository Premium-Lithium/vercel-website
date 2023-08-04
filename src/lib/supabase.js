import { createClient } from "@supabase/supabase-js";

export default const Supabase = createClient('https://uxgcbzwdhwzoyxfixkum.supabase.co', process.env.SUPABASE_KEY)

