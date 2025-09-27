// Utilities for working with profiles and related records in the database.

import { supabaseAdmin } from './supaAdmin';

/**
 * Ensure a profile exists for the given email. If one does not exist it will
 * be created. Returns the resulting profile row.
 */
export async function ensureProfile(email: string) {
  // Try to find an existing profile.
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing;
  // Create a new profile with just the email.
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({ email })
    .select('*')
    .single();
  if (insertError) throw insertError;
  return inserted;
}

/**
 * Fetch a profile by email along with all of its related data. Throws if no
 * profile is found.
 */
export async function getProfileWithRelations(email: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(
      `*,
      skills(*),
      achievements(*),
      narratives(*),
      goals(*),
      consents(*),
      events(*)`
    )
    .eq('email', email)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update the profile with the given email. Only the fields provided in
 * `fields` will be updated. Returns the updated profile.
 */
export async function updateProfile(email: string, fields: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(fields)
    .eq('email', email)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}