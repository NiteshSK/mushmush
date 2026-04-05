/**
 * Tests for SMS service (MSG91 integration).
 */

import { sendOTPViaSMS, isSMSConfigured } from '../sms';

// Mock fetch globally
global.fetch = jest.fn();

describe('SMS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSMSConfigured', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns false when MSG91_AUTH_KEY is missing', () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: '', MSG91_TEMPLATE_ID: 'tpl123' };
      expect(isSMSConfigured()).toBe(false);
    });

    it('returns false when MSG91_TEMPLATE_ID is missing', () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key123', MSG91_TEMPLATE_ID: '' };
      expect(isSMSConfigured()).toBe(false);
    });

    it('returns true when both are set', () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key123', MSG91_TEMPLATE_ID: 'tpl123' };
      expect(isSMSConfigured()).toBe(true);
    });
  });

  describe('sendOTPViaSMS', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns failure when SMS is not configured', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: '', MSG91_TEMPLATE_ID: '' };
      const result = await sendOTPViaSMS('9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns failure for invalid phone number', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key', MSG91_TEMPLATE_ID: 'tpl' };
      const result = await sendOTPViaSMS('123', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone');
    });

    it('normalizes 10-digit phone to 91 prefix', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key', MSG91_TEMPLATE_ID: 'tpl' };
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await sendOTPViaSMS('9876543210', '123456');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://control.msg91.com/api/v5/flow/',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"mobiles":"919876543210"'),
        })
      );
    });

    it('handles phone already prefixed with 91', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key', MSG91_TEMPLATE_ID: 'tpl' };
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await sendOTPViaSMS('919876543210', '123456');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"mobiles":"919876543210"'),
        })
      );
    });

    it('returns success when MSG91 responds OK', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key', MSG91_TEMPLATE_ID: 'tpl' };
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await sendOTPViaSMS('9876543210', '123456');
      expect(result.success).toBe(true);
    });

    it('returns failure when MSG91 responds with error', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key', MSG91_TEMPLATE_ID: 'tpl' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid authkey' }),
      });

      const result = await sendOTPViaSMS('9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid authkey');
    });

    it('handles network errors gracefully', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'key', MSG91_TEMPLATE_ID: 'tpl' };
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await sendOTPViaSMS('9876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send SMS');
    });

    it('sends authkey in header', async () => {
      process.env = { ...originalEnv, MSG91_AUTH_KEY: 'mykey123', MSG91_TEMPLATE_ID: 'tpl' };
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await sendOTPViaSMS('9876543210', '123456');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ authkey: 'mykey123' }),
        })
      );
    });
  });
});
