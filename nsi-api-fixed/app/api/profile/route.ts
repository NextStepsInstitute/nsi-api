// Adjust relative imports now that the project root is set to the `nsi-api` folder.
// From `app/api/profile/route.ts`, the `src/lib` folder is three directories up.
import { handleOptions, applyCors } from '../../../src/lib/cors';
import { jsonResponse } from '../../../src/lib/json';
import { ensureProfile, getProfileWithRelations, updateProfile } from '../../../src/lib/profile';
import { supabaseAdmin } from '../../../src/lib/supaAdmin';
import jwt from 'jsonwebtoken';

// Respond to OPTIONS preflight requests.
export async function OPTIONS(req: Request) {
  return handleOptions(req) ?? jsonResponse({ error: 'Method not allowed' }, 405);
}

// GET /api/profile?email=... : Return the profile and all related data.
export async function GET(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  if (!email) {
    return applyCors(req, jsonResponse({ error: 'Missing email query parameter' }, 400));
  }
  try {
    // Ensure a profile exists.
    await ensureProfile(email);
    // If the request contains a bearer token and JWT_SECRET is set, call the
    // link_profile_to_user RPC so Supabase associates the profile with the
    // authenticated user.
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const jwtSecret = process.env.JWT_SECRET;
    if (authHeader && authHeader.startsWith('Bearer ') && jwtSecret) {
      const token = authHeader.replace(/Bearer\s+/i, '');
      try {
        jwt.verify(token, jwtSecret);
        // Link the profile with the authenticated Supabase user.
        await supabaseAdmin.rpc('link_profile_to_user');
      } catch {
        // Ignore invalid tokens.
      }
    }
    const profile = await getProfileWithRelations(email);
    return applyCors(req, jsonResponse(profile));
  } catch (err: any) {
    return applyCors(req, jsonResponse({ error: err.message }, 500));
  }
}

// PATCH /api/profile : Update a profile with partial fields.
export async function PATCH(req: Request) {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  try {
    const body = await req.json();
    const email = body?.email as string;
    if (!email) {
      return applyCors(req, jsonResponse({ error: 'Email is required' }, 400));
    }
    // Remove email from fields before update.
    const { email: _e, ...fields } = body;
    await ensureProfile(email);
    const updated = await updateProfile(email, fields);
    return applyCors(req, jsonResponse(updated));
  } catch (err: any) {
    return applyCors(req, jsonResponse({ error: err.message }, 500));
  }
}