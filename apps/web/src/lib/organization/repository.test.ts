import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { SupabaseOrganizationRepository } from './repository';

const organizationRow = {
  id: 'organization-1',
  name: 'PaymentFlow Labs',
  status: 'active',
  created_by: 'user-1',
  created_at: '2026-08-18T00:00:00.000Z',
  updated_at: '2026-08-18T00:00:00.000Z',
};

const membershipRow = {
  organization_id: 'organization-1',
  user_id: 'user-1',
  role: 'owner',
  status: 'active',
  created_at: '2026-08-18T00:00:00.000Z',
  updated_at: '2026-08-18T00:00:00.000Z',
};

function createClient(options: {
  organizationResult?: { data: unknown; error: unknown };
  membershipResult?: { data: unknown; error: unknown };
  rpcResult?: { data: unknown; error: unknown };
}) {
  const select = vi.fn();
  const from = vi.fn((table: string) => ({
    select: select.mockResolvedValueOnce(
      table === 'organizations'
        ? (options.organizationResult ?? { data: [], error: null })
        : (options.membershipResult ?? { data: [], error: null }),
    ),
  }));
  const rpc = vi.fn().mockResolvedValue(options.rpcResult ?? { data: null, error: null });

  return { client: { from, rpc } as unknown as SupabaseClient, from, rpc };
}

describe('SupabaseOrganizationRepository', () => {
  it('lists organizations visible through RLS', async () => {
    const { client, from } = createClient({
      organizationResult: { data: [organizationRow], error: null },
    });

    await expect(
      new SupabaseOrganizationRepository(() => client).listAccessibleOrganizations(),
    ).resolves.toEqual([
      expect.objectContaining({ id: 'organization-1', name: 'PaymentFlow Labs' }),
    ]);
    expect(from).toHaveBeenCalledWith('organizations');
  });

  it('lists memberships visible through RLS', async () => {
    const { client, from } = createClient({
      membershipResult: { data: [membershipRow], error: null },
    });

    await expect(
      new SupabaseOrganizationRepository(() => client).listVisibleMemberships(),
    ).resolves.toEqual([
      expect.objectContaining({ organizationId: 'organization-1', userId: 'user-1' }),
    ]);
    expect(from).toHaveBeenCalledWith('organization_memberships');
  });

  it('creates an organization only through the trusted RPC', async () => {
    const { client, from, rpc } = createClient({
      rpcResult: { data: organizationRow, error: null },
    });

    await expect(
      new SupabaseOrganizationRepository(() => client).createOrganization('PaymentFlow Labs'),
    ).resolves.toMatchObject({ id: 'organization-1', name: 'PaymentFlow Labs' });
    expect(rpc).toHaveBeenCalledWith('create_organization', {
      organization_name: 'PaymentFlow Labs',
    });
    expect(from).not.toHaveBeenCalled();
  });

  it.each([
    ['organization listing', { organizationResult: { data: null, error: { message: 'secret' } } }],
    ['membership listing', { membershipResult: { data: null, error: { message: 'secret' } } }],
    ['organization creation', { rpcResult: { data: null, error: { message: 'secret' } } }],
  ])('normalizes provider failures for %s', async (operation, options) => {
    const { client } = createClient(options);
    const repository = new SupabaseOrganizationRepository(() => client);
    const request =
      operation === 'organization listing'
        ? repository.listAccessibleOrganizations()
        : operation === 'membership listing'
          ? repository.listVisibleMemberships()
          : repository.createOrganization('PaymentFlow Labs');

    await expect(request).rejects.toThrow(
      'Organization data is temporarily unavailable. Please try again.',
    );
    await expect(request).rejects.not.toThrow('secret');
  });
});
