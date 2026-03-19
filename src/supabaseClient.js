/* src/supabaseClient.js */
import { createClient } from '@supabase/supabase-js';

// Substitua pelos seus dados do Supabase (Settings -> API)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cwoyhgiwgufsipmuqsik.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'sb_publishable_KVbAj900jy2wl7KIvJQkJg_KN2m_D_J';

export const supabase = createClient(supabaseUrl, supabaseKey);
