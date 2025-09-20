import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ozxsnyibvkfdwutxfgby.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eHNueWlidmtmZHd1dHhmZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTkxMzMsImV4cCI6MjA3Mjk3NTEzM30.0BFLChBvZn9O2ppTSY_2TEDnQQ43VNfn9ULhmiGUiD8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
