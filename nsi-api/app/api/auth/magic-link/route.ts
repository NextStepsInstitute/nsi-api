import { handleOptions, applyCors } from '../../../../src/lib/cors';
import { jsonResponse } from '../../../../src/lib/json';
import { supabaseAnon } from '../../../../src/lib/supaAdmin';

// Respond to OPTIONS preflight requests.
export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// Send a Supabase magic link to the given email address. The redirect
// destination is read from the TOOLS_DOMAIN environment variable.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    if (!email) {
      return applyCors(req, jsonResponse({ error: 'Email is required' }, 400));
    }
    const redirectTo = process.env.TOOLS_DOMAIN || '';
    const { error } = await supabaseAnon.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) {
      return applyCors(req, jsonResponse({ error: error.message }, 500));
    }
    return applyCors(req, jsonResponse({ ok: true }));
  } catch (err: any) {
    return applyCors(req, jsonResponse({ error: err.message }, 500));
  }
}