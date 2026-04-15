import nodemailer from 'nodemailer';
import { escapeHtml } from './sanitize';
import { getAppUrl } from './get-base-url';

// ─── Gmail transporter (primary) ────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000, // 10s connect timeout
  greetingTimeout: 10000,   // 10s greeting timeout
  socketTimeout: 15000,     // 15s socket timeout
});

// ─── Zoho transporter (for @kosvana.com branded emails) ─────────────────
let zohoTransporter: nodemailer.Transporter | null = null;
if (process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASSWORD) {
  zohoTransporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.ZOHO_SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASSWORD,
    },
  });
}

// ─── Email routing helpers ──────────────────────────────────────────────

/** All admin recipients (vikrant + mushagroprod) */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean);
}

/** Order-specific recipients (admin + orders@kosvana.com) */
export function getOrderEmails(): string[] {
  const admins = getAdminEmails();
  const orders = process.env.ORDERS_EMAIL;
  if (orders) admins.push(orders);
  return Array.from(new Set(admins));
}

/** Concierge recipients (admin + concierge@kosvana.com) — for non-order notifications */
export function getConciergeEmails(): string[] {
  const admins = getAdminEmails();
  const concierge = process.env.CONCIERGE_EMAIL;
  if (concierge) admins.push(concierge);
  return Array.from(new Set(admins));
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  useZoho?: boolean;
}

/** Verify SMTP connection is working — call from an admin API route to diagnose issues */
export async function verifyEmailConnection(): Promise<{ gmail: boolean; zoho: boolean; gmailError?: string; zohoError?: string }> {
  const result = { gmail: false, zoho: false, gmailError: undefined as string | undefined, zohoError: undefined as string | undefined };
  try {
    await transporter.verify();
    result.gmail = true;
  } catch (err) {
    result.gmailError = err instanceof Error ? err.message : 'Unknown error';
    console.error('Gmail SMTP verify failed:', err);
  }
  if (zohoTransporter) {
    try {
      await zohoTransporter.verify();
      result.zoho = true;
    } catch (err) {
      result.zohoError = err instanceof Error ? err.message : 'Unknown error';
      console.error('Zoho SMTP verify failed:', err);
    }
  }
  return result;
}

export async function sendEmail({ to, subject, html, text, useZoho }: EmailOptions) {
  try {
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    const transport = useZoho && zohoTransporter ? zohoTransporter : transporter;
    const fromAddress = useZoho && process.env.ZOHO_SMTP_USER
      ? `"Kosvana" <${process.env.ZOHO_SMTP_USER}>`
      : `"Kosvana" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

    const info = await transport.sendMail({
      from: fromAddress,
      to: recipients,
      subject,
      html,
      text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Kosvana! 🌿',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5c8e61; margin: 0;">Welcome to Kosvana!</h1>
          <p style="color: #666; font-size: 16px;">Premium Mushrooms, Dry Fruits, Seeds & Spices</p>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #5c8e61; margin-top: 0;">Hello ${name}! 👋</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with Kosvana! We're excited to have you join our community of natural product enthusiasts.
          </p>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Your account has been successfully created and you can now:
          </p>
          <ul style="color: #333; line-height: 1.8; margin-left: 20px;">
            <li>Browse our premium collection of mushrooms, dry fruits, seeds & spices</li>
            <li>Add items to your wishlist</li>
            <li>Track your order history</li>
            <li>Get personalized recommendations</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${getAppUrl()}" 
             style="background: #5c8e61; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Start Shopping
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            If you have any questions, feel free to contact us at 
            <a href="mailto:concierge@kosvana.com" style="color: #5c8e61;">concierge@kosvana.com</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to Kosvana, ${name}!
      
      Thank you for registering with us. Your account has been successfully created.
      
      You can now browse our premium collection of mushrooms, dry fruits, seeds & spices, add items to your wishlist, and track your orders.
      
      Visit us at: ${getAppUrl()}
      
      If you have any questions, contact us at concierge@kosvana.com
      
      &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
    `
  }),

  subscriptionConfirm: (productTitle: string, productUrl: string) => ({
    subject: `You're subscribed for ${productTitle} restock alerts`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #5c8e61; margin: 0;">Subscription Confirmed</h2>
          <p style="color: #555;">We'll email you when this product is back in stock.</p>
        </div>
        <div style="background:#f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="margin:0; color:#333;">Product: <strong>${productTitle}</strong></p>
        </div>
        <div style="text-align:center; margin: 24px 0;">
          <a href="${productUrl}" style="background:#5c8e61; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none;">View Product</a>
        </div>
        <p style="color:#666; font-size:12px; text-align:center;">You can unsubscribe by clicking "Notify Me" again on the product page.</p>
      </div>
    `,
    text: `Subscription confirmed for ${productTitle}. We will notify you when it is back in stock. ${productUrl}`,
  }),

  restockAlert: (productTitle: string, productUrl: string) => ({
    subject: `Good news! ${productTitle} is back in stock!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #5c8e61; margin: 0;">Back in Stock! 🍄</h2>
          <p style="color: #555;">The product you've been waiting for is now available.</p>
        </div>
        <div style="background:#f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="margin:0; color:#333;">Product: <strong>${productTitle}</strong></p>
        </div>
        <div style="text-align:center; margin: 24px 0;">
          <a href="${productUrl}" style="background:#5c8e61; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">Shop Now</a>
        </div>
        <p style="color:#666; font-size:12px; text-align:center;">You received this email because you subscribed to restock alerts for this product.</p>
      </div>
    `,
    text: `Good news! ${productTitle} is back in stock! Visit: ${productUrl}`,
  }),

  resetPassword: (name: string, resetToken: string) => ({
    subject: 'Reset Your Kosvana Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5c8e61; margin: 0;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px;">Kosvana Account Security</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #5c8e61; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Kosvana account.
          </p>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Click the button below to reset your password. This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${getAppUrl()}/auth/reset-password?token=${resetToken}" 
             style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Need help? Contact us at 
            <a href="mailto:concierge@kosvana.com" style="color: #5c8e61;">concierge@kosvana.com</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request - Kosvana
      
      Hello ${name}!
      
      We received a request to reset your password for your Kosvana account.
      
      Reset your password by visiting this link:
      ${getAppUrl()}/auth/reset-password?token=${resetToken}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Need help? Contact us at concierge@kosvana.com
      
      &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
    `
  }),

  newUserSignup: (userName: string, userEmail: string, signupDate: Date) => ({
    subject: `New Signup: ${userName} (${userEmail})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5c8e61; margin: 0;">New User Signup</h1>
          <p style="color: #666; font-size: 16px;">Someone just joined Kosvana</p>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Name</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Email</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">
                <a href="mailto:${userEmail}" style="color: #5c8e61; text-decoration: none;">${userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px;">Signed up at</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right;">${signupDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${getAppUrl()}/admin/users"
             style="background: #5c8e61; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            View in Admin Panel
          </a>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated notification from Kosvana.
          </p>
        </div>
      </div>
    `,
    text: `New User Signup\n\nName: ${userName}\nEmail: ${userEmail}\nSigned up at: ${signupDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\nView in admin panel: ${getAppUrl()}/admin/users`
  }),

  userLogin: (userName: string, userEmail: string, loginDate: Date, method: string) => ({
    subject: `Login Alert: ${userName} (${userEmail})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5c8e61; margin: 0;">User Login</h1>
          <p style="color: #666; font-size: 16px;">Someone just logged in to Kosvana</p>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Name</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Email</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">
                <a href="mailto:${userEmail}" style="color: #5c8e61; text-decoration: none;">${userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Method</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${method}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px;">Time</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right;">${loginDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated login notification from Kosvana.
          </p>
        </div>
      </div>
    `,
    text: `User Login\n\nName: ${userName}\nEmail: ${userEmail}\nMethod: ${method}\nTime: ${loginDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
  }),

  restockNotification: (productTitle: string, productUrl: string, productImage: string) => ({
    subject: `🎉 ${productTitle} is Back in Stock!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5c8e61; margin: 0;">Great News!</h1>
          <p style="color: #666; font-size: 16px;">Your requested product is back in stock</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${productImage}" alt="${productTitle}" style="max-width: 200px; height: auto; border-radius: 8px;">
          </div>
          <h2 style="color: #5c8e61; margin-top: 0; text-align: center;">${productTitle}</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px; text-align: center;">
            The product you requested to be notified about is now available! 
            Don't wait too long - our products sell out quickly.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${productUrl}" 
             style="background: #5c8e61; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
            Shop Now
          </a>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #5c8e61; margin: 0; font-size: 14px; text-align: center;">
            <strong>Limited Stock:</strong> Get yours before it's gone again!
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            You're receiving this because you requested to be notified when this product is restocked.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Great News! ${productTitle} is Back in Stock!
      
      The product you requested to be notified about is now available.
      
      Shop now: ${productUrl}
      
      Don't wait too long - our products sell out quickly!
      
      You're receiving this because you requested to be notified when this product is restocked.
      
      &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
    `
  })
};

// Email notification utilities for training registrations and payments

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export interface RegistrationEmailData {
  registrationNumber: string;
  programName: string;
  participantName: string;
  totalAmount: number;
  status: string;
  participantEmail: string;
}

export interface PaymentEmailData {
  registrationNumber: string;
  programName: string;
  participantName: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  upiTransactionId: string;
  paymentDate: Date;
  participantEmail: string;
  programDuration: string;
  programSchedule: string;
  programStartDate?: string;
  programLocation?: string;
  programInstructor?: string;
}

// Generate registration confirmation email HTML
export function generateRegistrationConfirmationEmail(data: RegistrationEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #5c8e61; margin: 0;">Kosvana Training Registration</h1>
        <p style="color: #666; font-size: 16px;">Professional Cultivation Training</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #5c8e61;">
        <h2 style="color: #5c8e61; margin-top: 0;">Registration Confirmed! 🎉</h2>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${escapeHtml(data.participantName)}</strong>,
        </p>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Your registration for <strong>${escapeHtml(data.programName)}</strong> has been successfully confirmed. We're excited to have you join our comprehensive cultivation training program!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h3 style="color: #5c8e61; margin-top: 0; border-bottom: 2px solid #5c8e61; padding-bottom: 10px;">📋 Registration Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.registrationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Program Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Status:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Total Amount:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">₹${data.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin-top: 0;">📋 Important Instructions</h4>
          <ul style="color: #856404; line-height: 1.6; margin-left: 20px;">
            <li>Please save your registration number (<strong>${data.registrationNumber}</strong>) for future reference</li>
            <li>Bring this registration number and a valid ID proof on the training day</li>
            <li>Wear comfortable clothing suitable for practical sessions</li>
            <li>All training materials and equipment will be provided</li>
            <li>Certificate of completion will be awarded after successful completion</li>
          </ul>
        </div>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Our team will contact you 2-3 days before the training starts with final confirmation and any additional details.
        </p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${getAppUrl()}/training" 
           style="background: #5c8e61; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Training Programs
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          For any questions or assistance, please contact us:
        </p>
        <p style="color: #5c8e61; font-size: 14px; margin: 5px 0;">
          📧 <a href="mailto:concierge@kosvana.com" style="color: #5c8e61;">concierge@kosvana.com</a><br>
          📞 <a href="tel:+919876543210" style="color: #5c8e61;">+91 98765 43210</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 10px;">
          &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

// Generate payment confirmation email HTML
export function generatePaymentConfirmationEmail(data: PaymentEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #5c8e61; margin: 0;">Payment Confirmed! 🎉</h1>
        <p style="color: #666; font-size: 16px;">Kosvana Training Registration</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #28a745;">
        <h2 style="color: #28a745; margin-top: 0;">Payment Successfully Processed!</h2>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${escapeHtml(data.participantName)}</strong>,
        </p>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Great news! Your payment for <strong>${escapeHtml(data.programName)}</strong> has been successfully processed. Your training registration is now fully confirmed and you're all set to begin your cultivation journey!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h3 style="color: #5c8e61; margin-top: 0; border-bottom: 2px solid #5c8e61; padding-bottom: 10px;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #5c8e61; font-weight: bold;">${data.registrationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Program:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Amount Paid:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">₹${data.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Payment Method:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.paymentMethod)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Transaction ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: monospace; font-size: 12px;">${escapeHtml(data.upiTransactionId)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Payment Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.paymentDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Payment Status:</td>
              <td style="padding: 8px 0;">
                <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${data.paymentStatus}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h3 style="color: #5c8e61; margin-top: 0; border-bottom: 2px solid #5c8e61; padding-bottom: 10px;">📅 Training Timetable</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Program Duration:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programDuration)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Schedule:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programSchedule)}</td>
            </tr>
            ${data.programStartDate ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Start Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programStartDate)}</td>
            </tr>
            ` : ''}
            ${data.programLocation ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Location:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programLocation)}</td>
            </tr>
            ` : ''}
            ${data.programInstructor ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Lead Instructor:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${escapeHtml(data.programInstructor)}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
          <h4 style="color: #0c5460; margin-top: 0;">🚀 What's Next?</h4>
          <ol style="color: #0c5460; line-height: 1.6; margin-left: 20px;">
            <li><strong>Save your registration number</strong> (${data.registrationNumber}) for future reference</li>
            <li><strong>Check your email</strong> 2-3 days before training for final confirmation</li>
            <li><strong>Bring your registration number</strong> and valid ID proof on training day</li>
            <li><strong>Wear comfortable clothing</strong> suitable for hands-on practical sessions</li>
            <li><strong>Arrive 15 minutes early</strong> to complete check-in formalities</li>
          </ol>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin-top: 0;">📋 Training Highlights</h4>
          <ul style="color: #856404; line-height: 1.6; margin-left: 20px;">
            <li>Hands-on practical training with live cultures</li>
            <li>Comprehensive study materials and resources provided</li>
            <li>Expert guidance from experienced cultivators</li>
            <li>Certificate of completion upon successful program finish</li>
            <li>Post-training support and consultation available</li>
          </ul>
        </div>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          We're incredibly excited to have you join our cultivation community! If you have any questions before the training begins, please don't hesitate to reach out to us.
        </p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${getAppUrl()}/training" 
           style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Training Schedule
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          For any questions or assistance, please contact us:
        </p>
        <p style="color: #5c8e61; font-size: 14px; margin: 5px 0;">
          📧 <a href="mailto:concierge@kosvana.com" style="color: #5c8e61;">concierge@kosvana.com</a><br>
          📞 <a href="tel:+919876543210" style="color: #5c8e61;">+91 98765 43210</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 10px;">
          &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

// Send email function - now using actual email service
export async function sendTrainingEmail(emailData: EmailData): Promise<void> {
  try {
    // Log email details for development
    console.log('📧 Sending training email:', {
      to: emailData.to,
      subject: emailData.subject,
      contentLength: emailData.html.length
    });

    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ Email configuration missing. Please set SMTP_USER and SMTP_PASSWORD environment variables.');
      return;
    }

    // Use the existing sendEmail function with nodemailer
    const result = await sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: stripHtml(emailData.html) // Generate plain text version
    });

    if (result.success) {
    } else {
      console.error('❌ Email sending failed:', result.error);
    }

  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - email failure shouldn't break the main process
  }
}

// Helper function to strip HTML tags for plain text version
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Send registration confirmation email
export async function sendRegistrationConfirmationEmail(data: RegistrationEmailData): Promise<void> {
  const emailData: EmailData = {
    to: data.participantEmail,
    subject: `Training Registration Confirmed - ${data.registrationNumber}`,
    html: generateRegistrationConfirmationEmail(data)
  };

  await sendTrainingEmail(emailData);
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(data: PaymentEmailData): Promise<void> {
  const emailData: EmailData = {
    to: data.participantEmail,
    subject: `Payment Confirmed - ${data.registrationNumber}`,
    html: generatePaymentConfirmationEmail(data)
  };

  await sendTrainingEmail(emailData);
}

// Order and Invoice Email Templates

export interface OrderInvoiceEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  invoiceNumber: string;
  invoicePdfUrl: string;
  orderDate: Date;
  orderItems: Array<{
    productTitle: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  couponDiscount?: number;
  couponCode?: string | null;
  productDiscount?: number;
  total: number;
  shippingAddress: any;
}

/**
 * Generate order completion and invoice email HTML
 */
export function generateOrderInvoiceEmail(data: OrderInvoiceEmailData): string {
  // Check if invoicePdfUrl is already an absolute URL
  let invoiceDownloadUrl = data.invoicePdfUrl;

  if (!invoiceDownloadUrl.startsWith('http://') && !invoiceDownloadUrl.startsWith('https://')) {
    // It's a relative path, prepend the base URL
    let baseUrl = getAppUrl();
    if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    invoiceDownloadUrl = `${baseUrl}${data.invoicePdfUrl}`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #5c8e61 0%, #4a7a4f 100%); padding: 30px; border-radius: 10px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Completed! 🎉</h1>
        <p style="color: #e8f5e8; font-size: 16px; margin-top: 10px;">Thank you for your purchase</p>
      </div>
      
      <!-- Order Details -->
      <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #5c8e61; margin-top: 0; border-bottom: 2px solid #5c8e61; padding-bottom: 10px;">Order Details</h2>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${data.customerName}</strong>,
        </p>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Your order has been successfully completed and is ready for delivery! We've attached your invoice for your records.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Order Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #5c8e61; font-weight: bold;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Invoice Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #5c8e61; font-weight: bold;">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Order Date:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${new Date(data.orderDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</td>
          </tr>
        </table>
      </div>
      
      <!-- Order Items -->
      <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #5c8e61; margin-top: 0; border-bottom: 2px solid #5c8e61; padding-bottom: 10px;">Order Items</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #5c8e61; color: #5c8e61;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #5c8e61; color: #5c8e61;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #5c8e61; color: #5c8e61;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #5c8e61; color: #5c8e61;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.orderItems.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${escapeHtml(item.productTitle)}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;">₹${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <table style="width: 100%; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; text-align: right; color: #555;">Subtotal:</td>
            <td style="padding: 8px 0; text-align: right; width: 100px; font-weight: bold;">₹${data.subtotal.toFixed(2)}</td>
          </tr>
          ${data.productDiscount && data.productDiscount > 0 ? `<tr>
            <td style="padding: 8px 0; text-align: right; color: #5c8e61;">Product Discount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #5c8e61;">-₹${data.productDiscount.toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; text-align: right; color: #555;">Convenience Fee:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${data.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; text-align: right; color: #555;">Shipping:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${data.shipping.toFixed(2)}</td>
          </tr>
          ${data.couponDiscount && data.couponDiscount > 0 ? `<tr>
            <td style="padding: 8px 0; text-align: right; color: #5c8e61;">Coupon${data.couponCode ? ` (${data.couponCode})` : ''}:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #5c8e61;">-₹${data.couponDiscount.toFixed(2)}</td>
          </tr>` : ''}
          <tr style="border-top: 2px solid #5c8e61;">
            <td style="padding: 12px 0; text-align: right; color: #5c8e61; font-size: 18px; font-weight: bold;">Total:</td>
            <td style="padding: 12px 0; text-align: right; color: #5c8e61; font-size: 18px; font-weight: bold;">₹${data.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <!-- Shipping Address -->
      <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #5c8e61; margin-top: 0; border-bottom: 2px solid #5c8e61; padding-bottom: 10px;">Shipping Address</h3>
        <p style="color: #333; line-height: 1.6; margin: 0;">
          ${escapeHtml(data.shippingAddress.address || '')}<br>
          ${escapeHtml(data.shippingAddress.city || '')}, ${escapeHtml(data.shippingAddress.state || '')} ${escapeHtml(data.shippingAddress.zipCode || '')}<br>
          ${data.shippingAddress.country || 'India'}
        </p>
      </div>
      
      <!-- Download Invoice Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invoiceDownloadUrl}" 
           style="background: #5c8e61; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
          📄 Download Invoice
        </a>
      </div>
      
      <!-- What's Next -->
      <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #5c8e61;">
        <h4 style="color: #5c8e61; margin-top: 0;">📦 What's Next?</h4>
        <ul style="color: #5c8e61; line-height: 1.8; margin-left: 20px;">
          <li>Your order is being prepared for shipment</li>
          <li>You'll receive a tracking number once shipped</li>
          <li>Estimated delivery: 3-5 business days</li>
          <li>Keep your invoice for warranty and returns</li>
        </ul>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Need help with your order?
        </p>
        <p style="color: #5c8e61; font-size: 14px; margin: 5px 0;">
          📧 <a href="mailto:concierge@kosvana.com" style="color: #5c8e61; text-decoration: none;">concierge@kosvana.com</a><br>
          📞 <a href="tel:+917618362662" style="color: #5c8e61; text-decoration: none;">+91-7618362662</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Send order completion email with invoice
 */
export async function sendOrderInvoiceEmail(data: OrderInvoiceEmailData): Promise<void> {
  try {
    const emailData: EmailOptions = {
      to: data.customerEmail,
      subject: `Order Completed - Invoice #${data.invoiceNumber}`,
      html: generateOrderInvoiceEmail(data),
      text: stripHtml(generateOrderInvoiceEmail(data))
    };

    const result = await sendEmail(emailData);

    if (result.success) {
    } else {
      console.error('❌ Order invoice email failed:', result.error);
    }
  } catch (error) {
    console.error('Error sending order invoice email:', error);
    // Don't throw - email failure shouldn't break the order completion
  }
}

// ============================================
// ORDER LIFECYCLE EMAILS
// ============================================

interface OrderNotificationData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNumber: string;
  orderItems: Array<{ productTitle: string; quantity: number; price: number; originalPrice?: number; total: number }>;
  subtotal: number;
  shipping: number;
  couponDiscount?: number;
  productDiscount?: number;
  total: number;
  shippingAddress: { street?: string; city?: string; state?: string; zip?: string; address?: string };
}

function formatAddress(addr: any): string {
  return [addr?.street || addr?.address, addr?.city, addr?.state, addr?.zip].filter(Boolean).join(', ');
}

function orderItemsTable(items: OrderNotificationData['orderItems']): string {
  return items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.productTitle)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toFixed(2)}</td>
    </tr>
  `).join('');
}

function orderEmailWrapper(title: string, subtitle: string, color: string, body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
      <div style="background: ${color}; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">${title}</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">${subtitle}</p>
      </div>
      <div style="padding: 30px; background: white;">
        ${body}
      </div>
      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products</p>
      </div>
    </div>
  `;
}

function orderSummaryBlock(data: OrderNotificationData): string {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Item</th>
          <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
          <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Price</th>
          <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Total</th>
        </tr>
      </thead>
      <tbody>${orderItemsTable(data.orderItems)}</tbody>
    </table>
    <div style="text-align: right; margin-top: 10px;">
      <p style="margin: 4px 0; color: #6b7280;">Subtotal: ₹${data.subtotal.toFixed(2)}</p>
      ${data.productDiscount ? `<p style="margin: 4px 0; color: #059669;">Product Discount: -₹${data.productDiscount.toFixed(2)}</p>` : ''}
      <p style="margin: 4px 0; color: #6b7280;">Shipping: ${data.shipping === 0 ? 'FREE' : '₹' + data.shipping.toFixed(2)}</p>
      ${data.couponDiscount ? `<p style="margin: 4px 0; color: #059669;">Coupon Discount: -₹${data.couponDiscount.toFixed(2)}</p>` : ''}
      <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #111;">Total: ₹${data.total.toFixed(2)}</p>
    </div>
    <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Delivery Address</p>
      <p style="margin: 5px 0 0; color: #374151;">${formatAddress(data.shippingAddress)}</p>
    </div>
  `;
}

/** Email sent to ADMIN + ORDERS when a new order is placed */
export async function sendAdminNewOrderEmail(data: OrderNotificationData): Promise<void> {
  const recipients = getOrderEmails();
  if (recipients.length === 0) return;
  const adminEmail = recipients.join(', ');

  const html = orderEmailWrapper(
    'New Order Received!',
    `Order #${data.orderNumber}`,
    '#1e40af',
    `
      <p style="color: #374151;">A new order has been placed. Details below:</p>
      <div style="padding: 15px; background: #eff6ff; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Customer:</strong> ${escapeHtml(data.customerName)}</p>
        <p style="margin: 5px 0 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.customerEmail)}" style="color: #1e40af;">${escapeHtml(data.customerEmail)}</a></p>
        ${data.customerPhone ? `<p style="margin: 5px 0 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(data.customerPhone)}" style="color: #1e40af;">${escapeHtml(data.customerPhone)}</a></p>` : ''}
        <p style="margin: 5px 0 0;"><strong>Order #:</strong> ${escapeHtml(data.orderNumber)}</p>
      </div>
      ${orderSummaryBlock(data)}
      <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">This order is awaiting payment. You'll be notified when payment is submitted.</p>
    `
  );

  try {
    const result = await sendEmail({ to: adminEmail, subject: `New Order #${data.orderNumber} — ₹${data.total.toFixed(2)}`, html });
    if (!result.success) console.error('Admin order email failed:', result.error);
  } catch (err) {
    console.error('Admin order email error:', err);
  }
}

/** Email sent to CUSTOMER when they place an order (before payment) */
export async function sendOrderPlacedEmail(data: OrderNotificationData): Promise<void> {
  const html = orderEmailWrapper(
    'Order Placed Successfully!',
    `Order #${data.orderNumber}`,
    '#059669',
    `
      <p style="color: #374151;">Hi ${data.customerName},</p>
      <p style="color: #374151;">Thank you for your order! Please complete the payment to confirm it.</p>
      ${orderSummaryBlock(data)}
      <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 13px;">
        <strong>Next step:</strong> Complete your UPI payment to confirm this order. Your order will be processed once payment is verified.
      </p>
    `
  );

  try {
    const result = await sendEmail({ to: data.customerEmail, subject: `Order Placed — #${data.orderNumber}`, html });
    if (!result.success) console.error('Order placed email failed for', data.customerEmail, ':', result.error);
  } catch (err) {
    console.error('Order placed email error:', err);
  }
}

/** Email sent to CUSTOMER + ADMIN when payment is submitted */
export async function sendPaymentReceivedEmail(data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderNumber: string;
  transactionId: string;
  amount: number;
  orderItems?: Array<{ productTitle: string; quantity: number; price: number; total: number }>;
  subtotal?: number;
  shipping?: number;
  productDiscount?: number;
  shippingAddress?: { street?: string; city?: string; state?: string; zip?: string; address?: string };
}): Promise<void> {
  const customerHtml = orderEmailWrapper(
    'Payment Received!',
    `Order #${data.orderNumber}`,
    '#059669',
    `
      <p style="color: #374151;">Hi ${escapeHtml(data.customerName)},</p>
      <p style="color: #374151;">We've received your payment of <strong>₹${data.amount.toFixed(2)}</strong>.</p>
      <div style="padding: 15px; background: #f0fdf4; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Transaction ID:</strong> ${escapeHtml(data.transactionId)}</p>
        <p style="margin: 5px 0 0;"><strong>Amount:</strong> ₹${data.amount.toFixed(2)}</p>
        <p style="margin: 5px 0 0;"><strong>Status:</strong> Awaiting verification</p>
      </div>
      ${data.orderItems ? `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead><tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Item</th>
            <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Total</th>
          </tr></thead>
          <tbody>${data.orderItems.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.productTitle)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      ` : ''}
      <p style="color: #6b7280; font-size: 13px;">Our team will verify your payment shortly. You'll receive a confirmation once it's verified.</p>
    `
  );

  const adminHtml = orderEmailWrapper(
    'Payment Submitted — Verify Now',
    `Order #${data.orderNumber}`,
    '#d97706',
    `
      <p style="color: #374151;">A payment has been submitted and needs verification.</p>
      <div style="padding: 15px; background: #fffbeb; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Customer:</strong> ${escapeHtml(data.customerName)}</p>
        <p style="margin: 5px 0 0;"><strong>Email:</strong> ${escapeHtml(data.customerEmail)}</p>
        ${data.customerPhone ? `<p style="margin: 5px 0 0;"><strong>Phone:</strong> ${escapeHtml(data.customerPhone)}</p>` : ''}
        <p style="margin: 5px 0 0;"><strong>Order #:</strong> ${escapeHtml(data.orderNumber)}</p>
        <p style="margin: 5px 0 0;"><strong>Transaction ID:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 4px;">${escapeHtml(data.transactionId)}</code></p>
        <p style="margin: 5px 0 0;"><strong>Amount:</strong> ₹${data.amount.toFixed(2)}</p>
      </div>
      ${data.orderItems ? `
        <h3 style="font-size: 14px; color: #374151; margin: 20px 0 10px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead><tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Product</th>
            <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Price</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Total</th>
          </tr></thead>
          <tbody>${data.orderItems.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.productTitle)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}</tbody>
        </table>
        <div style="text-align: right; margin-top: 10px;">
          ${data.subtotal ? `<p style="margin: 4px 0; color: #6b7280;">Subtotal: ₹${data.subtotal.toFixed(2)}</p>` : ''}
          ${data.productDiscount ? `<p style="margin: 4px 0; color: #059669;">Product Discount: -₹${data.productDiscount.toFixed(2)}</p>` : ''}
          ${data.shipping !== undefined ? `<p style="margin: 4px 0; color: #6b7280;">Shipping: ${data.shipping === 0 ? 'FREE' : '₹' + data.shipping.toFixed(2)}</p>` : ''}
          <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #111;">Total: ₹${data.amount.toFixed(2)}</p>
        </div>
      ` : ''}
      ${data.shippingAddress ? `
        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Shipping Address</p>
          <p style="margin: 5px 0 0; color: #374151;">${formatAddress(data.shippingAddress)}</p>
        </div>
      ` : ''}
      <p style="margin-top: 20px; color: #374151;">Please verify this payment in the <a href="${getAppUrl()}/admin/payment-verification" style="color: #d97706; font-weight: 600;">admin dashboard</a>.</p>
    `
  );

  try {
    const orderRecipients = getOrderEmails();
    const results = await Promise.allSettled([
      sendEmail({ to: data.customerEmail, subject: `Payment Received — Order #${data.orderNumber}`, html: customerHtml }),
      orderRecipients.length > 0 ? sendEmail({ to: orderRecipients, subject: `Payment to Verify — Order #${data.orderNumber} — ₹${data.amount.toFixed(2)}`, html: adminHtml }) : Promise.resolve(),
    ]);
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Payment email [${i}] failed:`, r.reason);
    });
  } catch (err) {
    console.error('Payment received email error:', err);
  }
}

/** Email sent to CUSTOMER when order status changes */
export async function sendOrderStatusEmail(data: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: string;
  total: number;
  orderItems?: Array<{ productTitle: string; quantity: number; price: number; total: number }>;
  shippingAddress?: any;
  subtotal?: number;
  shipping?: number;
  couponDiscount?: number;
  productDiscount?: number;
}): Promise<void> {
  const statusConfig: Record<string, { title: string; message: string; color: string }> = {
    PAYMENT_RECEIVED: {
      title: 'Payment Received!',
      message: 'We\'ve received your payment details. Our team will verify it shortly and confirm your order.',
      color: '#2563eb',
    },
    CONFIRMED: {
      title: 'Order Confirmed!',
      message: 'Your payment has been verified and your order is confirmed. We\'ll start processing it shortly.',
      color: '#059669',
    },
    PROCESSING: {
      title: 'Order Being Prepared',
      message: 'Great news! We\'re packing your order and getting it ready for shipping.',
      color: '#2563eb',
    },
    SHIPPED: {
      title: 'Order Shipped!',
      message: 'Your order is on its way! You\'ll receive it within the estimated delivery time.',
      color: '#7c3aed',
    },
    DELIVERED: {
      title: 'Order Delivered!',
      message: 'Your order has been delivered. We hope you enjoy your products! If you have any issues, please contact us.',
      color: '#059669',
    },
    CANCELLED: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If you made a payment, it will be refunded within 5-7 business days.',
      color: '#dc2626',
    },
  };

  const config = statusConfig[data.status];
  if (!config) return;

  const html = orderEmailWrapper(
    config.title,
    `Order #${data.orderNumber}`,
    config.color,
    `
      <p style="color: #374151;">Hi ${data.customerName},</p>
      <p style="color: #374151;">${config.message}</p>
      ${data.orderItems && data.orderItems.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead><tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Item</th>
            <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Price</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Total</th>
          </tr></thead>
          <tbody>${data.orderItems.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.productTitle)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}</tbody>
        </table>
        <div style="text-align: right; margin-top: 10px;">
          ${data.subtotal ? `<p style="margin: 4px 0; color: #6b7280;">Subtotal: ₹${data.subtotal.toFixed(2)}</p>` : ''}
          ${data.productDiscount ? `<p style="margin: 4px 0; color: #059669;">Product Discount: -₹${data.productDiscount.toFixed(2)}</p>` : ''}
          ${data.shipping !== undefined ? `<p style="margin: 4px 0; color: #6b7280;">Shipping: ${data.shipping === 0 ? 'FREE' : '₹' + data.shipping.toFixed(2)}</p>` : ''}
          ${data.couponDiscount ? `<p style="margin: 4px 0; color: #059669;">Coupon: -₹${data.couponDiscount.toFixed(2)}</p>` : ''}
          <p style="margin: 8px 0 0; font-size: 18px; font-weight: bold; color: #111;">Total: ₹${data.total.toFixed(2)}</p>
        </div>
      ` : `
        <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Order:</strong> #${data.orderNumber}</p>
          <p style="margin: 5px 0 0;"><strong>Total:</strong> ₹${data.total.toFixed(2)}</p>
        </div>
      `}
      ${data.shippingAddress ? `
        <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Delivery Address</p>
          <p style="margin: 5px 0 0; color: #374151;">${formatAddress(data.shippingAddress)}</p>
        </div>
      ` : ''}
      <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">For any questions, reply to this email or contact us at concierge@kosvana.com</p>
    `
  );

  try {
    const result = await sendEmail({ to: data.customerEmail, subject: `${config.title} — Order #${data.orderNumber}`, html });
    if (!result.success) console.error('Order status email failed:', result.error);
  } catch (err) {
    console.error('Order status email error:', err);
  }
}

// ============================================
// OTP EMAIL FUNCTIONS
// ============================================

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateOTP(): string {
  const { randomInt } = require('crypto');
  return randomInt(100000, 999999).toString();
}

/**
 * Generate OTP email HTML
 * @param purpose - 'signup' for email verification, 'order' for order verification
 */
export function generateOTPEmail(otp: string, customerName: string, purpose: 'signup' | 'order' = 'order'): string {
  const heading = purpose === 'signup' ? 'Verify Your Email' : 'Verify Your Order';
  const instruction = purpose === 'signup'
    ? 'To verify your email and complete registration, please use the following One-Time Password (OTP):'
    : 'To complete your order, please use the following One-Time Password (OTP):';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #5c8e61 0%, #4a7a4f 100%); padding: 30px; border-radius: 10px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${heading}</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Kosvana - Premium Natural Products</p>
      </div>

      <!-- Content -->
      <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Hello ${customerName},
        </p>

        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
          ${instruction}
        </p>

        <!-- OTP Box -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #5c8e61; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
          <p style="font-size: 42px; font-weight: bold; color: #5c8e61; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${otp}
          </p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 30px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            ⏰ <strong>Important:</strong> This OTP is valid for <strong>10 minutes</strong> only.
          </p>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you didn't request this OTP, please ignore this email or contact our support team.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">
          <strong>Kosvana - Premium Mushrooms, Dry Fruits, Seeds & Spices</strong>
        </p>
        <p style="margin: 0 0 5px 0;">
          📧 Email: concierge@kosvana.com | 📞 Phone: +91-7618362662
        </p>
        <p style="margin: 10px 0 0 0; color: #999;">
          © ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Send OTP email
 * @param purpose - 'signup' for email verification, 'order' for order verification
 */
export async function sendOTPEmail(email: string, otp: string, customerName: string, purpose: 'signup' | 'order' = 'order') {
  try {
    const subjectMap = { signup: 'Verify Your Email - Kosvana', order: 'Your Kosvana Verification Code' };
    const textMap = {
      signup: `Your OTP to verify your email is: ${otp}. This OTP is valid for 5 minutes.`,
      order: `Your OTP for order verification is: ${otp}. This OTP is valid for 10 minutes.`,
    };
    const emailData: EmailOptions = {
      to: email,
      subject: subjectMap[purpose],
      html: generateOTPEmail(otp, customerName, purpose),
      text: textMap[purpose],
    };

    const result = await sendEmail(emailData);

    if (result.success) {
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ OTP email failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
