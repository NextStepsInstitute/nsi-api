// Adjust relative imports for the project root at `nsi-api`.  From
// `app/api/goals/route.ts`, the `src/lib` folder is three directories up.
import { handleOptions, applyCors } from '../../../src/lib/cors';
import { jsonResponse } from '../../../src/lib/json';
import { ensureProfile } from '../../../src/lib/profile';
import { supabaseAdmin } from '../../../src/lib/supaAdmin';

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// POST /api/goals : Insert a new goal for a profile.
export async function POST(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    const goal_90d = body?.goal_90d as string | undefined;
    const weekly_time_commitment = body?.weekly_time_commitment as number | undefined;
    const milestones = body?.milestones as any[] | undefined;
    const progress_score = body?.progress_score as number | undefined;
    if (!email) {
      return applyCors(req, jsonResponse({ error: 'Email is required' }, 400));
    }
    const profile = await ensureProfile(email);
    const insert: any = { profile_id: profile.id };
    if (goal_90d !== undefined) insert.goal_90d = goal_90d;
    if (weekly_time_commitment !== undefined) insert.weekly_time_commitment = weekly_time_commitment;
    if (milestones !== undefined) insert.milestones = milestones;
    if (progress_score !== undefined) insert.progress_score = progress_score;
    const { data, error } = await supabaseAdmin
      .from('goals')
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