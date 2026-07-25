export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 12) return 'Password must be at least 12 characters';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors['email'] = emailError;
  if (passwordError) errors['password'] = passwordError;
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSignupForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult {
  const errors: Record<string, string> = {};
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (nameError) errors['name'] = nameError;
  if (emailError) errors['email'] = emailError;
  if (passwordError) errors['password'] = passwordError;
  if (!confirmPassword) {
    errors['confirmPassword'] = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors['confirmPassword'] = 'Passwords do not match';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
