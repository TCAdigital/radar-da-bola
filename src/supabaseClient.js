import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cwoyhgiwgufsipmuqsik.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3b3loZ2l3Z3Vmc2lwbXVxc2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ3MzYsImV4cCI6MjA4ODk5MDczNn0.CioKepsqgBiUJc7HHrtAcd2eRRTUrZzr79xZjIP2J_U';

export const supabase = createClient(supabaseUrl, supabaseKey);
