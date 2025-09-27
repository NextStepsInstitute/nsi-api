// Adjust relative imports for the project root at `nsi-api`.  From
// `app/api/events/route.ts`, the `src/lib` folder sits three directories up.
import { handleOptions, applyCors } from '../../../src/lib/cors';
import { jsonResponse } from '../../../src/lib/json';
import { ensureProfile } from '../../../src/lib/profile';
import { supabaseAdmin } from '../../../src/lib/supaAdmin';

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// POST /api/events : Append an event for a profile.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    const tool = body?.tool as string;
    const action = body?.action as string;
    const payload_json = body?.payload_json as any;
    if (!email || !tool || !action) {
      return applyCors(req, jsonResponse({ error: 'Email, tool and action are required' }, 400));
    }
    const profile = await ensureProfile(email);
    const insert: any = {
      profile_id: profile.id,
      tool,
      action,
      payload_json: payload_json ?? {},
    };
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(insert)
      .select('*')
      .single();
    if (error) {
      return applyCors(req, jsonResponse({ error: error.message }, 500));
    }
    return applyCors(req, jsonResponse(data));
  } catch (err: any) {
    return applyCors(req, jsonResponse({ error: err.message }, 500));
  }
}