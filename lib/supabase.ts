import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_supabase) {
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export interface OutreachSession {
  id?: string;
  created_at?: string;
  email?: string;
  tool_used: string;
  degree?: string;
  work_experience?: string;
  skills?: string;
  interests?: string;
  target_salary?: string;
  location?: string;
  target_role?: string;
  target_company?: string;
  linkedin_input?: string;
  job_description?: string;
  match_score?: number;
  bridge_keywords?: object;
  generated_companies?: object;
  generated_roles?: object;
  career_roadmap?: object;
  outreach_linkedin?: string;
  outreach_email?: string;
  outreach_recruiter?: string;
}

export async function saveSession(session: OutreachSession) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase not configured — session not saved.');
    return null;
  }
  const { data, error } = await supabase
    .from('outreach_sessions')
    .insert([session])
    .select()
    .single();

  if (error) {
    console.error('Failed to save session:', error);
    return null;
  }
  return data;
}
