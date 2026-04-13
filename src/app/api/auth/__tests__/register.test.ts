/**
 * @jest-environment node
 *
 * Tests for POST /api/auth/register
 *
 * These tests verify:
 * - OTP is required and validated before account creation
 * - Welcome email is sent after successful registration
 * - Welcome email failure is logged but doesn't break registration
 * - Admin notification is sent
 */

// --- Mocks (must be declared before imports) ---

const mockSendEmail = jest.fn();
const mockWelcomeTemplate = jest.fn();
const mockNewUserSignupTemplate = jest.fn();
const mockGetConciergeEmails = jest.fn();

jest.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
  emailTemplates: {
    welcome: (...args: any[]) => mockWelcomeTemplate(...args),
    newUserSignup: (...args: any[]) => mockNewUserSignupTemplate(...args),
  },
  getConciergeEmails: () => mockGetConciergeEmails(),
}));

const mockOtpVerify = jest.fn();
jest.mock('@/lib/otp-store', () => ({
  otpStore: { verify: (...args: any[]) => mockOtpVerify(...args) },
}));

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('@/lib/validation', () => ({
  validatePasswordPolicy: jest.fn().mockReturnValue({ valid: true }),
}));

jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn().mockReturnValue({ allowed: true }),
}));

// --- Import after mocks ---
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

// --- Helpers ---

function makeRequest(body: Record<string, any>) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecurePass123!',
  otp: '123456',
};

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date('2026-01-01'),
};

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();

  // Default happy-path mocks
  mockOtpVerify.mockResolvedValue({ valid: true });
  mockFindUnique.mockResolvedValue(null); // user doesn't exist
  mockCreate.mockResolvedValue(mockUser);
  mockWelcomeTemplate.mockReturnValue({
    subject: 'Welcome!',
    html: '<p>Welcome</p>',
    text: 'Welcome',
  });
  mockNewUserSignupTemplate.mockReturnValue({
    subject: 'New signup',
    html: '<p>New user</p>',
    text: 'New user',
  });
  mockGetConciergeEmails.mockReturnValue(['admin@kosvana.com']);
  mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });
});

describe('POST /api/auth/register', () => {
  it('returns 400 when OTP is missing', async () => {
    const res = await POST(makeRequest({ ...validBody, otp: undefined }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/OTP/i);
  });

  it('returns 400 when OTP is invalid', async () => {
    mockOtpVerify.mockResolvedValue({ valid: false, error: 'Invalid OTP' });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid OTP');
  });

  it('creates user and returns 201 on valid OTP', async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe('User created successfully');
    expect(data.user.email).toBe('test@example.com');
    expect(mockOtpVerify).toHaveBeenCalledWith('test@example.com', '123456');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('sends welcome email after successful registration', async () => {
    await POST(makeRequest(validBody));

    expect(mockWelcomeTemplate).toHaveBeenCalledWith('Test User');
    // First sendEmail call is the welcome email
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Welcome!',
      })
    );
  });

  it('logs error when welcome email fails but still returns 201', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSendEmail
      .mockResolvedValueOnce({ success: false, error: 'SMTP timeout' }) // welcome fails
      .mockResolvedValueOnce({ success: true }); // admin succeeds

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to send welcome email:',
      'SMTP timeout'
    );
    consoleSpy.mockRestore();
  });

  it('sends admin notification after registration', async () => {
    await POST(makeRequest(validBody));

    expect(mockNewUserSignupTemplate).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      expect.any(Date)
    );
    // Second sendEmail call is admin notification
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });

  it('returns 409 when user already exists', async () => {
    mockFindUnique.mockResolvedValue({ id: 'existing' });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
  });
});
