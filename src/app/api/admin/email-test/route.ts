import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyEmailConnection, sendEmail } from '@/lib/email';

// GET /api/admin/email-test — verify SMTP connection
// POST /api/admin/email-test — send a test email
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await verifyEmailConnection();

  return NextResponse.json({
    ...result,
    config: {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-10) : 'NOT SET',
      smtpPassword: process.env.SMTP_PASSWORD ? 'SET (hidden)' : 'NOT SET',
      zohoUser: process.env.ZOHO_SMTP_USER ? '***' + process.env.ZOHO_SMTP_USER.slice(-10) : 'NOT SET',
      adminEmail: process.env.ADMIN_EMAIL || 'NOT SET',
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to } = await request.json();
  const recipient = to || session.user.email;

  const result = await sendEmail({
    to: recipient,
    subject: 'Kosvana Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
        <h2 style="color: #5c8e61;">Email is working!</h2>
        <p>This is a test email from your Kosvana store.</p>
        <p style="color: #666; font-size: 13px;">Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
  });

  return NextResponse.json({ recipient, ...result });
}
