// Adjust relative imports for the project root at `nsi-api`.  From
// `app/api/narratives/route.ts`, the `src/lib` folder is three directories up.
import { handleOptions, applyCors } from '../../../src/lib/cors';
import { jsonResponse } from '../../../src/lib/json';
import { ensureProfile } from '../../../src/lib/profile';
import { supabaseAdmin } from '../../../src/lib/supaAdmin';

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// POST /api/narratives : Insert a new narrative entry for a profile.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    const kind = body?.kind as string;
    const content = body?.content as string;
    const source_tool = body?.source_tool as string | undefined;
    if (!email || !kind || !content) {
      return applyCors(req, jsonResponse({ error: 'Email, kind and content are required' }, 400));
    }
    const profile = await ensureProfile(email);
    const insert: any = {
      profile_id: profile.id,
      kind,
      content,
    };
    if (source_tool) insert.source_tool = source_tool;
    const { data, error } = await supabaseAdmin
      .from('narratives')
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