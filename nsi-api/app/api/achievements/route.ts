import { handleOptions, applyCors } from '../../../../src/lib/cors';
import { jsonResponse } from '../../../../src/lib/json';
import { ensureProfile } from '../../../../src/lib/profile';
import { supabaseAdmin } from '../../../../src/lib/supaAdmin';

// OPTIONS handler
export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// POST /api/achievements : Insert a new achievement for a profile.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    const raw_text = body?.raw_text as string;
    const source_tool = body?.source_tool as string | undefined;
    if (!email || !raw_text) {
      return applyCors(req, jsonResponse({ error: 'Email and raw_text are required' }, 400));
    }
    const profile = await ensureProfile(email);
    const insert = {
      profile_id: profile.id,
      raw_text,
      source_tool,
    } as any;
    const { data, error } = await supabaseAdmin
      .from('achievements')
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