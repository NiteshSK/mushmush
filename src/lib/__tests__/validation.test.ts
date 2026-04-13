import {
  validatePasswordPolicy,
  validateEmail,
  validatePhone,
  validateName,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePincode,
  validateCity,
  validateStreet,
} from '../validation';

describe('validation', () => {
  describe('validatePasswordPolicy', () => {
    it('returns error for empty password', () => {
      expect(validatePasswordPolicy('')).toEqual({ valid: false, error: 'Password is required' });
    });

    it('returns error for weak password', () => {
      const result = validatePasswordPolicy('short');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/at least 8 characters/);
    });

    it('returns error for password without uppercase', () => {
      const result = validatePasswordPolicy('longpassword!');
      expect(result.valid).toBe(false);
    });

    it('returns error for password without special character', () => {
      const result = validatePasswordPolicy('Longpassword1');
      expect(result.valid).toBe(false);
    });

    it('returns valid for strong password', () => {
      expect(validatePasswordPolicy('MyP@ssw0rd!')).toEqual({ valid: true });
    });
  });

  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('returns error for whitespace-only email', () => {
      expect(validateEmail('   ')).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('notanemail')).toBe('Please enter a valid email address');
      expect(validateEmail('missing@domain')).toBe('Please enter a valid email address');
      expect(validateEmail('@nodomain.com')).toBe('Please enter a valid email address');
    });

    it('returns null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('test.user@domain.co.in')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('returns null for empty phone (optional)', () => {
      expect(validatePhone('')).toBeNull();
      expect(validatePhone('   ')).toBeNull();
    });

    it('returns error for invalid Indian mobile number', () => {
      expect(validatePhone('1234567890')).toBe('Please enter a valid 10-digit Indian mobile number');
      expect(validatePhone('5555555555')).toBe('Please enter a valid 10-digit Indian mobile number');
      expect(validatePhone('12345')).toBe('Please enter a valid 10-digit Indian mobile number');
    });

    it('returns null for valid Indian mobile number', () => {
      expect(validatePhone('9876543210')).toBeNull();
      expect(validatePhone('7618362662')).toBeNull();
      expect(validatePhone('6000000000')).toBeNull();
    });

    it('strips +91 prefix before validating', () => {
      expect(validatePhone('919876543210')).toBeNull();
    });
  });

  describe('validateName', () => {
    it('returns error for empty name', () => {
      expect(validateName('')).toBe('Name is required');
      expect(validateName('   ')).toBe('Name is required');
    });

    it('uses custom label', () => {
      expect(validateName('', 'First name')).toBe('First name is required');
    });

    it('returns error for single character', () => {
      expect(validateName('A')).toBe('Name must be at least 2 characters');
    });

    it('returns error for invalid characters', () => {
      expect(validateName('John123')).toBe('Name contains invalid characters');
      expect(validateName('Test@User')).toBe('Name contains invalid characters');
    });

    it('returns null for valid names', () => {
      expect(validateName('John')).toBeNull();
      expect(validateName("O'Brien")).toBeNull();
      expect(validateName('Pravesh Rawat')).toBeNull();
      expect(validateName('Mary-Jane')).toBeNull();
    });
  });

  describe('validateRequired', () => {
    it('returns error for empty value', () => {
      expect(validateRequired('')).toBe('This field is required');
      expect(validateRequired('   ')).toBe('This field is required');
    });

    it('uses custom label', () => {
      expect(validateRequired('', 'Subject')).toBe('Subject is required');
    });

    it('returns null for non-empty value', () => {
      expect(validateRequired('hello')).toBeNull();
    });
  });

  describe('validateMinLength', () => {
    it('returns error when below minimum', () => {
      expect(validateMinLength('ab', 5)).toBe('This field must be at least 5 characters');
    });

    it('uses custom label', () => {
      expect(validateMinLength('ab', 5, 'Message')).toBe('Message must be at least 5 characters');
    });

    it('returns null when at or above minimum', () => {
      expect(validateMinLength('hello', 5)).toBeNull();
      expect(validateMinLength('hello world', 5)).toBeNull();
    });
  });

  describe('validateMaxLength', () => {
    it('returns error when above maximum', () => {
      expect(validateMaxLength('hello world', 5)).toBe('This field must be at most 5 characters');
    });

    it('uses custom label', () => {
      expect(validateMaxLength('hello world', 5, 'Message')).toBe('Message must be at most 5 characters');
    });

    it('returns null when at or below maximum', () => {
      expect(validateMaxLength('hello', 5)).toBeNull();
      expect(validateMaxLength('hi', 5)).toBeNull();
    });
  });

  describe('validatePincode', () => {
    it('returns error for empty pincode', () => {
      expect(validatePincode('')).toBe('PIN code is required');
      expect(validatePincode('   ')).toBe('PIN code is required');
    });

    it('returns error for non-6-digit pincode', () => {
      expect(validatePincode('12345')).toBe('PIN code must be exactly 6 digits');
      expect(validatePincode('1234567')).toBe('PIN code must be exactly 6 digits');
      expect(validatePincode('abcdef')).toBe('PIN code must be exactly 6 digits');
      expect(validatePincode('12345a')).toBe('PIN code must be exactly 6 digits');
    });

    it('returns null for valid 6-digit pincode', () => {
      expect(validatePincode('248142')).toBeNull();
      expect(validatePincode('110001')).toBeNull();
      expect(validatePincode('400001')).toBeNull();
    });
  });

  describe('validateCity', () => {
    it('returns error for empty city', () => {
      expect(validateCity('')).toBe('City is required');
      expect(validateCity('   ')).toBe('City is required');
    });

    it('uses custom label', () => {
      expect(validateCity('', 'Town')).toBe('Town is required');
    });

    it('returns error for invalid characters', () => {
      expect(validateCity('City123')).toBe('City contains invalid characters');
      expect(validateCity('City@Name')).toBe('City contains invalid characters');
    });

    it('returns null for valid city names', () => {
      expect(validateCity('Mumbai')).toBeNull();
      expect(validateCity('New Delhi')).toBeNull();
      expect(validateCity("St. John's")).toBeNull();
      expect(validateCity('Dehradun')).toBeNull();
    });
  });

  describe('validateStreet', () => {
    it('returns error for empty street', () => {
      expect(validateStreet('')).toBe('Street address is required');
      expect(validateStreet('   ')).toBe('Street address is required');
    });

    it('returns error for too short street address', () => {
      expect(validateStreet('Hi')).toBe('Please enter a complete street address');
      expect(validateStreet('123')).toBe('Please enter a complete street address');
    });

    it('returns null for valid street addresses', () => {
      expect(validateStreet('123 Main Street')).toBeNull();
      expect(validateStreet('NH 507, Herbertpur')).toBeNull();
      expect(validateStreet('Flat 4B, Tower 2')).toBeNull();
    });
  });
});
