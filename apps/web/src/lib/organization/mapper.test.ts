import { describe, expect, it } from 'vitest';
import { mapOrganizationMembershipRow, mapOrganizationRow } from './mapper';

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

describe('organization mappers', () => {
  it('maps an organization row to the application model', () => {
    expect(mapOrganizationRow(organizationRow)).toEqual({
      id: 'organization-1',
      name: 'PaymentFlow Labs',
      status: 'active',
      createdBy: 'user-1',
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    });
  });

  it('maps a membership row to the application model', () => {
    expect(mapOrganizationMembershipRow(membershipRow)).toEqual({
      organizationId: 'organization-1',
      userId: 'user-1',
      role: 'owner',
      status: 'active',
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    });
  });

  it('rejects an invalid organization status', () => {
    expect(() => mapOrganizationRow({ ...organizationRow, status: 'pending' })).toThrow(
      'Organization data is invalid.',
    );
  });

  it('rejects invalid membership role and status values', () => {
    expect(() => mapOrganizationMembershipRow({ ...membershipRow, role: 'admin' })).toThrow(
      'Organization membership data is invalid.',
    );
    expect(() => mapOrganizationMembershipRow({ ...membershipRow, status: 'invited' })).toThrow(
      'Organization membership data is invalid.',
    );
  });
});
