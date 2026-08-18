import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  mapOrganizationMembershipRow,
  mapOrganizationRow,
  type OrganizationMembershipRow,
  type OrganizationRow,
} from './mapper';
import type { Organization, OrganizationMembership } from './types';

const ORGANIZATION_UNAVAILABLE_MESSAGE =
  'Organization data is temporarily unavailable. Please try again.';

export interface OrganizationRepository {
  listAccessibleOrganizations(): Promise<Organization[]>;
  listVisibleMemberships(): Promise<OrganizationMembership[]>;
  createOrganization(name: string): Promise<Organization>;
}

export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly getClient: () => SupabaseClient = getSupabaseBrowserClient) {}

  async listAccessibleOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await this.getClient()
        .from('organizations')
        .select('id, name, status, created_by, created_at, updated_at');

      if (error) throw error;
      return (data as OrganizationRow[]).map(mapOrganizationRow);
    } catch {
      throw new Error(ORGANIZATION_UNAVAILABLE_MESSAGE);
    }
  }

  async listVisibleMemberships(): Promise<OrganizationMembership[]> {
    try {
      const { data, error } = await this.getClient()
        .from('organization_memberships')
        .select('organization_id, user_id, role, status, created_at, updated_at');

      if (error) throw error;
      return (data as OrganizationMembershipRow[]).map(mapOrganizationMembershipRow);
    } catch {
      throw new Error(ORGANIZATION_UNAVAILABLE_MESSAGE);
    }
  }

  async createOrganization(name: string): Promise<Organization> {
    try {
      const { data, error } = await this.getClient().rpc('create_organization', {
        organization_name: name,
      });

      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error('Organization creation returned no data.');
      return mapOrganizationRow(row as OrganizationRow);
    } catch {
      throw new Error(ORGANIZATION_UNAVAILABLE_MESSAGE);
    }
  }
}

export const organizationRepository: OrganizationRepository = new SupabaseOrganizationRepository();
