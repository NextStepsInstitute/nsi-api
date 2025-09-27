// Centralised Supabase client definitions.
//
// The admin client uses the service role key which has elevated privileges and
// should only be used server‑side. The anon client uses the anon key and is
// suitable for public operations such as sending magic links.

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not defined');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is not defined');
}

const supabaseUrl = process.env.SUPABASE_URL;

// Admin client uses the service role key. Do not expose this client to the browser.
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      persistSession: false,
    },
    global: { headers: { 'X-Client-Info': 'nsi-admin' } },
  }
);

// Anon client uses the anon key. This client is used for operations that do
// not require elevated permissions such as sending magic links. The anon
// key should be safe to expose to the browser if needed.
export const supabaseAnon = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: false,
    },
    global: { headers: { 'X-Client-Info': 'nsi-anon' } },
  }
);