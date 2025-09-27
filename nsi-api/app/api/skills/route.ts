import { handleOptions, applyCors } from '../../../../src/lib/cors';
import { jsonResponse } from '../../../../src/lib/json';
import { ensureProfile } from '../../../../src/lib/profile';
import { supabaseAdmin } from '../../../../src/lib/supaAdmin';

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// POST /api/skills : Insert a new skill for a profile.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    const name = body?.name as string;
    const type = body?.type as string;
    const level = body?.level as string | undefined;
    const confidence = body?.confidence as number | undefined;
    const source_tool = body?.source_tool as string | undefined;
    if (!email || !name || !type) {
      return applyCors(req, jsonResponse({ error: 'Email, name and type are required' }, 400));
    }
    const profile = await ensureProfile(email);
    const insert: any = {
      profile_id: profile.id,
      name,
      type,
    };
    if (level) insert.level = level;
    if (confidence !== undefined) insert.confidence = confidence;
    if (source_tool) insert.source_tool = source_tool;
    const { data, error } = await supabaseAdmin
      .from('skills')
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