import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateLoginForm,
  validateSignupForm,
} from './validation';

describe('validateEmail', () => {
  it('rejects empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('rejects invalid email', () => {
    expect(validateEmail('notanemail')).toBe('Enter a valid email address');
    expect(validateEmail('missing@')).toBe('Enter a valid email address');
  });

  it('accepts valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('rejects empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('rejects short password', () => {
    expect(validatePassword('short')).toBe('Password must be at least 12 characters');
    expect(validatePassword('11chars____')).toBe('Password must be at least 12 characters');
  });

  it('accepts valid password', () => {
    expect(validatePassword('12charpasswd')).toBeNull();
    expect(validatePassword('a-very-long-and-secure-password')).toBeNull();
  });
});

describe('validateName', () => {
  it('rejects empty name', () => {
    expect(validateName('')).toBe('Name is required');
    expect(validateName('   ')).toBe('Name is required');
  });

  it('rejects single char name', () => {
    expect(validateName('A')).toBe('Name must be at least 2 characters');
  });

  it('accepts valid name', () => {
    expect(validateName('Jane Smith')).toBeNull();
  });
});

describe('validateLoginForm', () => {
  it('returns valid for correct inputs', () => {
    const result = validateLoginForm('user@test.com', 'validpassword1');
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('returns errors for empty inputs', () => {
    const result = validateLoginForm('', '');
    expect(result.valid).toBe(false);
    expect(result.errors['email']).toBeDefined();
    expect(result.errors['password']).toBeDefined();
  });
});

describe('validateSignupForm', () => {
  it('returns valid for correct inputs', () => {
    const result = validateSignupForm('Jane', 'jane@test.com', 'validpassword1', 'validpassword1');
    expect(result.valid).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = validateSignupForm('Jane', 'jane@test.com', 'validpassword1', 'differentpasswd');
    expect(result.valid).toBe(false);
    expect(result.errors['confirmPassword']).toBe('Passwords do not match');
  });

  it('rejects empty confirmation', () => {
    const result = validateSignupForm('Jane', 'jane@test.com', 'validpassword1', '');
    expect(result.valid).toBe(false);
    expect(result.errors['confirmPassword']).toBe('Please confirm your password');
  });

  it('collects multiple errors', () => {
    const result = validateSignupForm('', '', 'short', '');
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
  });
});
