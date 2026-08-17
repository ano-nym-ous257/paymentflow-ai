import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapProfileRow, type ProfileRow } from './mapper';
import type { UserProfile } from './types';

const PROFILE_UNAVAILABLE_MESSAGE = 'Your profile is temporarily unavailable. Please try again.';

export interface ProfileRepository {
  getByAuthenticatedUserId(userId: string): Promise<UserProfile | null>;
}

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly getClient: () => SupabaseClient = getSupabaseBrowserClient) {}

  async getByAuthenticatedUserId(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.getClient()
        .from('profiles')
        .select('id, display_name, avatar_url, status, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data ? mapProfileRow(data as ProfileRow) : null;
    } catch {
      throw new Error(PROFILE_UNAVAILABLE_MESSAGE);
    }
  }
}

export const profileRepository: ProfileRepository = new SupabaseProfileRepository();
