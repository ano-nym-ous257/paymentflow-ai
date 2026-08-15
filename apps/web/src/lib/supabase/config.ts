const PASSWORD_UPDATE_PATH = '/auth/update-password';

export function getPasswordRecoveryRedirectUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) {
    throw new Error('Application URL configuration is missing.');
  }

  let applicationUrl: URL;
  try {
    applicationUrl = new URL(configuredUrl);
  } catch {
    throw new Error('Application URL configuration is invalid.');
  }

  if (!['http:', 'https:'].includes(applicationUrl.protocol)) {
    throw new Error('Application URL configuration is invalid.');
  }

  const normalizedBaseUrl = applicationUrl.toString().replace(/\/+$/, '');
  return `${normalizedBaseUrl}${PASSWORD_UPDATE_PATH}`;
}
