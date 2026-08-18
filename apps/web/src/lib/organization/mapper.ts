import {
  ORGANIZATION_MEMBERSHIP_ROLES,
  ORGANIZATION_MEMBERSHIP_STATUSES,
  ORGANIZATION_STATUSES,
  type Organization,
  type OrganizationMembership,
  type OrganizationMembershipRole,
  type OrganizationMembershipStatus,
  type OrganizationStatus,
} from './types';

export interface OrganizationRow {
  id: string;
  name: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembershipRow {
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function isOrganizationStatus(value: string): value is OrganizationStatus {
  return ORGANIZATION_STATUSES.some((status) => status === value);
}

function isMembershipRole(value: string): value is OrganizationMembershipRole {
  return ORGANIZATION_MEMBERSHIP_ROLES.some((role) => role === value);
}

function isMembershipStatus(value: string): value is OrganizationMembershipStatus {
  return ORGANIZATION_MEMBERSHIP_STATUSES.some((status) => status === value);
}

export function mapOrganizationRow(row: OrganizationRow): Organization {
  if (!isOrganizationStatus(row.status)) {
    throw new Error('Organization data is invalid.');
  }

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrganizationMembershipRow(
  row: OrganizationMembershipRow,
): OrganizationMembership {
  if (!isMembershipRole(row.role) || !isMembershipStatus(row.status)) {
    throw new Error('Organization membership data is invalid.');
  }

  return {
    organizationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
