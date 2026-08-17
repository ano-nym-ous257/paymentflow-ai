import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthenticatedUser } from './types';

export function mapSupabaseUser(user: SupabaseUser): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email ?? '',
    createdAt: user.created_at,
  };
}
