export type PasswordValidationResult = { valid: boolean; error?: string };

// At least 8 chars, at least one uppercase, at least one special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[a-zA-Z\s'.,-]{2,50}$/;

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

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null; // optional by default
  const digits = phone.replace(/\D/g, '').replace(/^91/, '');
  if (!PHONE_REGEX.test(digits)) return 'Please enter a valid 10-digit Indian mobile number';
  return null;
}

export function validateName(name: string, label = 'Name'): string | null {
  if (!name.trim()) return `${label} is required`;
  if (name.trim().length < 2) return `${label} must be at least 2 characters`;
  if (!NAME_REGEX.test(name.trim())) return `${label} contains invalid characters`;
  return null;
}

export function validateRequired(value: string, label = 'This field'): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export function validateMinLength(value: string, min: number, label = 'This field'): string | null {
  if (value.length < min) return `${label} must be at least ${min} characters`;
  return null;
}

export function validateMaxLength(value: string, max: number, label = 'This field'): string | null {
  if (value.length > max) return `${label} must be at most ${max} characters`;
  return null;
}

const PINCODE_REGEX = /^\d{6}$/;

export function validatePincode(pincode: string): string | null {
  if (!pincode.trim()) return 'PIN code is required';
  if (!PINCODE_REGEX.test(pincode.trim())) return 'PIN code must be exactly 6 digits';
  return null;
}

const CITY_REGEX = /^[a-zA-Z\s'.,-]{2,50}$/;

export function validateCity(city: string, label = 'City'): string | null {
  if (!city.trim()) return `${label} is required`;
  if (!CITY_REGEX.test(city.trim())) return `${label} contains invalid characters`;
  return null;
}

export function validateStreet(street: string): string | null {
  if (!street.trim()) return 'Street address is required';
  if (street.trim().length < 5) return 'Please enter a complete street address';
  return null;
}
