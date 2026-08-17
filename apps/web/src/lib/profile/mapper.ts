import { USER_PROFILE_STATUSES, type UserProfile, type UserProfileStatus } from './types';

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function isUserProfileStatus(value: string): value is UserProfileStatus {
  return USER_PROFILE_STATUSES.some((status) => status === value);
}

export function mapProfileRow(row: ProfileRow): UserProfile {
  if (!isUserProfileStatus(row.status)) {
    throw new Error('Profile data is invalid.');
  }

  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
