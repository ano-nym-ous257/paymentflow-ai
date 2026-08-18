export const ORGANIZATION_STATUSES = ['active', 'suspended', 'closed'] as const;
export const ORGANIZATION_MEMBERSHIP_ROLES = ['owner', 'member'] as const;
export const ORGANIZATION_MEMBERSHIP_STATUSES = ['active', 'suspended'] as const;

export type OrganizationId = string;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
export type OrganizationMembershipRole = (typeof ORGANIZATION_MEMBERSHIP_ROLES)[number];
export type OrganizationMembershipStatus = (typeof ORGANIZATION_MEMBERSHIP_STATUSES)[number];

export interface Organization {
  id: OrganizationId;
  name: string;
  status: OrganizationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  organizationId: OrganizationId;
  userId: string;
  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
  createdAt: string;
  updatedAt: string;
}
