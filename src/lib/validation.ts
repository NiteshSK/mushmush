export type PasswordValidationResult = { valid: boolean; error?: string };

// At least 8 chars, at least one uppercase, at least one special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export function validatePasswordPolicy(password: string): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      error:
        'Password must be at least 8 characters, include an uppercase letter and a special character',
    };
  }
  return { valid: true };
}

export const passwordRequirementsText =
  'At least 8 characters, include an uppercase letter and a special character';


