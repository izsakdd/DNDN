import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hjzkorssvwihentuzknx.supabase.co";
const supabaseAnonKey = "sb_publishable_pc8mvHMehI3UMzRjvwzaDQ_ljKLGkde";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);