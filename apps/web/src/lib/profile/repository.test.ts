import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { SupabaseProfileRepository } from './repository';

function createClient(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { client: { from } as unknown as SupabaseClient, from, select, eq };
}

describe('SupabaseProfileRepository', () => {
  it('retrieves the current application profile by authenticated subject ID', async () => {
    const row = {
      id: 'user-1',
      display_name: 'PaymentFlow Owner',
      avatar_url: null,
      status: 'active',
      created_at: '2026-08-14T00:00:00.000Z',
      updated_at: '2026-08-14T00:00:00.000Z',
    };
    const { client, from, eq } = createClient({ data: row, error: null });

    await expect(
      new SupabaseProfileRepository(() => client).getByAuthenticatedUserId('user-1'),
    ).resolves.toMatchObject({ id: 'user-1', displayName: 'PaymentFlow Owner' });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('returns null when the authenticated subject has no profile', async () => {
    const { client } = createClient({ data: null, error: null });
    await expect(
      new SupabaseProfileRepository(() => client).getByAuthenticatedUserId('user-1'),
    ).resolves.toBeNull();
  });

  it('normalizes database failures without exposing provider details', async () => {
    const { client } = createClient({ data: null, error: { message: 'database detail' } });
    await expect(
      new SupabaseProfileRepository(() => client).getByAuthenticatedUserId('user-1'),
    ).rejects.toThrow('Your profile is temporarily unavailable. Please try again.');
  });
});
