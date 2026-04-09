import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://vgvchiimzungtbiqsrez.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndmNoaWltenVuZ3RiaXFzcmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTAyODYsImV4cCI6MjA5MTIyNjI4Nn0.q3hdMznWDBje5lzW3Mmy-IGWqdUw7UtwlCyi_m7a_Zg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE products ADD COLUMN rating numeric DEFAULT 0; ALTER TABLE products ADD COLUMN reviews integer DEFAULT 0;' });
  console.log('Result:', data, error);
}
test();
