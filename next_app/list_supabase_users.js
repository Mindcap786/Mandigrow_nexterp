const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) console.error(error);
  else console.log(JSON.stringify(data.users.map(u => ({ email: u.email, role: u.user_metadata?.role })), null, 2));
}

listUsers();
