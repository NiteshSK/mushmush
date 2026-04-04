/**
 * SMS service using MSG91 Transactional SMS API.
 *
 * Required env vars:
 *   MSG91_AUTH_KEY    — your MSG91 authkey
 *   MSG91_TEMPLATE_ID — DLT-registered template ID
 *   MSG91_SENDER_ID   — 6-char sender ID (e.g. "KOSVNA")
 *
 * If MSG91_AUTH_KEY is not set, SMS sending is silently skipped
 * (email remains the primary OTP channel).
 */

interface SendSMSResult {
  success: boolean;
  error?: string;
}

/**
 * Send an OTP via SMS using MSG91 Flow API.
 *
 * @param phone — 10-digit Indian mobile number (with or without +91 prefix)
 * @param otp — the OTP code to send
 */
export async function sendOTPViaSMS(phone: string, otp: string): Promise<SendSMSResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'KOSVNA';

  if (!authKey || !templateId) {
    // SMS not configured — skip silently (email is primary)
    return { success: false, error: 'SMS not configured' };
  }

  // Normalize phone: ensure it starts with 91 (India country code)
  const cleanPhone = phone.replace(/\D/g, '');
  const normalizedPhone = cleanPhone.startsWith('91')
    ? cleanPhone
    : `91${cleanPhone.slice(-10)}`;

  if (normalizedPhone.length !== 12) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const response = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        sender: senderId,
        short_url: '0',
        mobiles: normalizedPhone,
        // MSG91 template variables — the template should have {{otp}} placeholder
        otp: otp,
        OTP: otp, // Some templates use uppercase
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData?.message || `MSG91 error: ${response.status}`,
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: 'Failed to send SMS' };
  }
}

/**
 * Check if SMS service is configured and available.
 */
export function isSMSConfigured(): boolean {
  return !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);
}
