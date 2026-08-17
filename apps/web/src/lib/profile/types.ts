export const USER_PROFILE_STATUSES = [
  'pending_verification',
  'active',
  'locked',
  'suspended',
  'closed',
] as const;

export type UserProfileStatus = (typeof USER_PROFILE_STATUSES)[number];

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  status: UserProfileStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProfileState =
  | { status: 'unresolved'; profile: null; error: null }
  | { status: 'loading'; profile: null; error: null }
  | { status: 'unauthenticated'; profile: null; error: null }
  | { status: 'available'; profile: UserProfile; error: null }
  | { status: 'missing'; profile: null; error: null }
  | { status: 'error'; profile: null; error: string };
