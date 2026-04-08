import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to the provided project details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vgvchiimzungtbiqsrez.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndmNoaWltenVuZ3RiaXFzcmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTAyODYsImV4cCI6MjA5MTIyNjI4Nn0.q3hdMznWDBje5lzW3Mmy-IGWqdUw7UtwlCyi_m7a_Zg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
