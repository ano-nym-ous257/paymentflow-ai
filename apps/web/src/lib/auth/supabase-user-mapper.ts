import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from './types';

export function mapSupabaseUser(user: SupabaseUser): User {
  const email = user.email ?? '';
  const metadataName = user.user_metadata?.['full_name'];
  const name =
    typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : email.split('@')[0] || 'PaymentFlow user';

  return {
    id: user.id,
    email,
    name,
    role: 'viewer',
    organization: '',
    createdAt: user.created_at,
  };
}
