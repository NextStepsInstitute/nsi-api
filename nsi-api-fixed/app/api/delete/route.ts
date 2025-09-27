// Adjust relative imports for the project root at `nsi-api`.  From
// `app/api/delete/route.ts`, the `src/lib` folder lives three directories up.
import { handleOptions, applyCors } from '../../../src/lib/cors';
import { jsonResponse } from '../../../src/lib/json';
import { supabaseAdmin } from '../../../src/lib/supaAdmin';

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// POST /api/delete : Delete a profile and all child rows for the given email.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    if (!email) {
      return applyCors(req, jsonResponse({ error: 'Email is required' }, 400));
    }
    // Delete the profile row; all child rows will cascade via foreign keys.
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('email', email);
    if (error) {
      return applyCors(req, jsonResponse({ error: error.message }, 500));
    }
    return applyCors(req, jsonResponse({ ok: true }));
  } catch (err: any) {
    return applyCors(req, jsonResponse({ error: err.message }, 500));
  }
}