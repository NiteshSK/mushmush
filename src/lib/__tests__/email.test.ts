import { generateOTPEmail, generateOTP, emailTemplates } from '../email';

describe('generateOTP', () => {
  it('generates a 6-digit numeric string', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generates different OTPs on successive calls', () => {
    const otps = new Set(Array.from({ length: 10 }, () => generateOTP()));
    // At least 2 unique values out of 10 (probabilistically near-certain)
    expect(otps.size).toBeGreaterThan(1);
  });
});

describe('generateOTPEmail', () => {
  it('defaults to order verification heading', () => {
    const html = generateOTPEmail('123456', 'John');
    expect(html).toContain('Verify Your Order');
    expect(html).toContain('To complete your order');
    expect(html).toContain('123456');
    expect(html).toContain('John');
  });

  it('uses order verification heading when purpose is "order"', () => {
    const html = generateOTPEmail('654321', 'Jane', 'order');
    expect(html).toContain('Verify Your Order');
    expect(html).toContain('To complete your order');
  });

  it('uses email verification heading when purpose is "signup"', () => {
    const html = generateOTPEmail('111222', 'Alice', 'signup');
    expect(html).toContain('Verify Your Email');
    expect(html).toContain('verify your email and complete registration');
    expect(html).not.toContain('Verify Your Order');
    expect(html).not.toContain('To complete your order');
  });

  it('includes the OTP code in the email body', () => {
    const html = generateOTPEmail('987654', 'Bob', 'signup');
    expect(html).toContain('987654');
  });

  it('includes the customer name', () => {
    const html = generateOTPEmail('123456', 'Charlie', 'signup');
    expect(html).toContain('Charlie');
  });
});

describe('emailTemplates.welcome', () => {
  it('returns subject, html, and text', () => {
    const result = emailTemplates.welcome('TestUser');
    expect(result.subject).toBeDefined();
    expect(result.html).toBeDefined();
    expect(result.text).toBeDefined();
  });

  it('includes the user name in html and text', () => {
    const result = emailTemplates.welcome('Vikrant');
    expect(result.html).toContain('Vikrant');
    expect(result.text).toContain('Vikrant');
  });

  it('includes Welcome to Kosvana in subject', () => {
    const result = emailTemplates.welcome('User');
    expect(result.subject).toContain('Welcome to Kosvana');
  });

  it('includes a Start Shopping CTA', () => {
    const result = emailTemplates.welcome('User');
    expect(result.html).toContain('Start Shopping');
  });

  it('includes concierge contact email', () => {
    const result = emailTemplates.welcome('User');
    expect(result.html).toContain('concierge@kosvana.com');
  });
});
