// Adjust relative imports for the project root at `nsi-api`.  From
// `app/api/export/route.ts`, the `src/lib` folder is three directories up.
import { handleOptions, applyCors } from '../../../src/lib/cors';
import { jsonResponse } from '../../../src/lib/json';
import { ensureProfile, getProfileWithRelations } from '../../../src/lib/profile';

export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// GET /api/export?email=... : Export profile and related data as JSON.
export async function GET(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  if (!email) {
    return applyCors(req, jsonResponse({ error: 'Missing email query parameter' }, 400));
  }
  try {
    // Ensure the profile exists.
    await ensureProfile(email);
    const profile = await getProfileWithRelations(email);
    return applyCors(req, jsonResponse(profile));
  } catch (err: any) {
    return applyCors(req, jsonResponse({ error: err.message }, 500));
  }
}