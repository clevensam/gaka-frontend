import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tgnljtmvigschazflxis.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nXfVOz8QEqs1mT0sxx_nYw_P8fmPVmI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
