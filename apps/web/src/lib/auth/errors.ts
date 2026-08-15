export const EMAIL_CONFIRMATION_REQUIRED_MESSAGE =
  'Check your email to verify your account before signing in.';
export const INVALID_RECOVERY_SESSION_MESSAGE =
  'This password recovery link is invalid or has expired.';

const AUTH_ERROR_MESSAGES = {
  invalidCredentials: 'Email or password is incorrect.',
  accountNotConfirmed: 'Please verify your email before signing in.',
  emailRegistered: 'An account with this email already exists.',
  rateLimited: 'Too many authentication attempts. Please try again later.',
  unavailable: 'Authentication is temporarily unavailable. Please try again.',
  configuration: 'Authentication is not configured correctly. Please contact support.',
  weakPassword: 'Password does not meet the security requirements.',
  reusedPassword: 'New password must be different from your current password.',
  invalidRecovery: INVALID_RECOVERY_SESSION_MESSAGE,
  unknown: 'Authentication failed. Please try again.',
} as const;

export function normalizeAuthError(error?: unknown): Error {
  const candidate =
    error && typeof error === 'object'
      ? (error as { code?: string; message?: string; status?: number })
      : undefined;
  const code = candidate?.code?.toLowerCase() ?? '';
  const message = candidate?.message?.toLowerCase() ?? '';

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return new Error(AUTH_ERROR_MESSAGES.invalidCredentials);
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return new Error(AUTH_ERROR_MESSAGES.accountNotConfirmed);
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return new Error(AUTH_ERROR_MESSAGES.emailRegistered);
  }
  if (candidate?.status === 429 || code.includes('rate_limit') || message.includes('rate limit')) {
    return new Error(AUTH_ERROR_MESSAGES.rateLimited);
  }
  if (message.includes('application url configuration')) {
    return new Error(AUTH_ERROR_MESSAGES.configuration);
  }
  if (code === 'weak_password' || message.includes('password should be at least')) {
    return new Error(AUTH_ERROR_MESSAGES.weakPassword);
  }
  if (code === 'same_password' || message.includes('different from the old password')) {
    return new Error(AUTH_ERROR_MESSAGES.reusedPassword);
  }
  if (
    code === 'session_expired' ||
    code === 'session_not_found' ||
    code === 'refresh_token_not_found' ||
    code === 'refresh_token_already_used' ||
    message.includes('auth session missing')
  ) {
    return new Error(AUTH_ERROR_MESSAGES.invalidRecovery);
  }
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to connect') ||
    (candidate?.status !== undefined && candidate.status >= 500)
  ) {
    return new Error(AUTH_ERROR_MESSAGES.unavailable);
  }
  return new Error(AUTH_ERROR_MESSAGES.unknown);
}
