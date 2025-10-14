import { NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/lib/email';

export async function GET() {
  try {
    const testEmail = 'mushagroprod@gmail.com'; // Send to your own email
    const testName = 'Test User';
    const otp = generateOTP();
    
    console.log('🧪 Testing OTP Email System');
    console.log('📧 Sending to:', testEmail);
    console.log('🔐 OTP:', otp);
    
    const result = await sendOTPEmail(testEmail, otp, testName);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test OTP email sent successfully!',
        email: testEmail,
        otp: otp, // Only for testing - remove in production
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
