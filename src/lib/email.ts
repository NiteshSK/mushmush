import nodemailer from 'nodemailer';

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"MushMush" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to MushMush! 🍄',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2d5016; margin: 0;">Welcome to MushMush!</h1>
          <p style="color: #666; font-size: 16px;">Fresh Edible and Medicinal Mushrooms</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #2d5016; margin-top: 0;">Hello ${name}! 👋</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with MushMush! We're excited to have you join our community of mushroom enthusiasts.
          </p>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Your account has been successfully created and you can now:
          </p>
          <ul style="color: #333; line-height: 1.8; margin-left: 20px;">
            <li>Browse our premium collection of fresh mushrooms</li>
            <li>Add items to your wishlist</li>
            <li>Track your order history</li>
            <li>Get personalized recommendations</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
             style="background: #2d5016; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Start Shopping
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            If you have any questions, feel free to contact us at 
            <a href="mailto:support@mushmush.in" style="color: #2d5016;">support@mushmush.in</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            &copy; 2024 MushMush. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to MushMush, ${name}!
      
      Thank you for registering with us. Your account has been successfully created.
      
      You can now browse our premium collection of fresh mushrooms, add items to your wishlist, and track your orders.
      
      Visit us at: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}
      
      If you have any questions, contact us at support@mushmush.in
      
      &copy; 2024 MushMush. All rights reserved.
    `
  }),

  subscriptionConfirm: (productTitle: string, productUrl: string) => ({
    subject: `You're subscribed for ${productTitle} restock alerts`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2d5016; margin: 0;">Subscription Confirmed</h2>
          <p style="color: #555;">We'll email you when this product is back in stock.</p>
        </div>
        <div style="background:#f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="margin:0; color:#333;">Product: <strong>${productTitle}</strong></p>
        </div>
        <div style="text-align:center; margin: 24px 0;">
          <a href="${productUrl}" style="background:#2d5016; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none;">View Product</a>
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
          <h2 style="color: #2d5016; margin: 0;">Back in Stock! 🍄</h2>
          <p style="color: #555;">The product you've been waiting for is now available.</p>
        </div>
        <div style="background:#f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="margin:0; color:#333;">Product: <strong>${productTitle}</strong></p>
        </div>
        <div style="text-align:center; margin: 24px 0;">
          <a href="${productUrl}" style="background:#2d5016; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">Shop Now</a>
        </div>
        <p style="color:#666; font-size:12px; text-align:center;">You received this email because you subscribed to restock alerts for this product.</p>
      </div>
    `,
    text: `Good news! ${productTitle} is back in stock! Visit: ${productUrl}`,
  }),

  resetPassword: (name: string, resetToken: string) => ({
    subject: 'Reset Your MushMush Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2d5016; margin: 0;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px;">MushMush Account Security</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #2d5016; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your MushMush account.
          </p>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Click the button below to reset your password. This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}" 
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
            <a href="mailto:support@mushmush.in" style="color: #2d5016;">support@mushmush.in</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            &copy; 2024 MushMush. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request - MushMush
      
      Hello ${name}!
      
      We received a request to reset your password for your MushMush account.
      
      Reset your password by visiting this link:
      ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Need help? Contact us at support@mushmush.in
      
      &copy; 2024 MushMush. All rights reserved.
    `
  }),

  restockNotification: (productTitle: string, productUrl: string, productImage: string) => ({
    subject: `🎉 ${productTitle} is Back in Stock!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2d5016; margin: 0;">Great News!</h1>
          <p style="color: #666; font-size: 16px;">Your requested product is back in stock</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${productImage}" alt="${productTitle}" style="max-width: 200px; height: auto; border-radius: 8px;">
          </div>
          <h2 style="color: #2d5016; margin-top: 0; text-align: center;">${productTitle}</h2>
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px; text-align: center;">
            The product you requested to be notified about is now available! 
            Don't wait too long - our fresh mushrooms sell out quickly.
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${productUrl}" 
             style="background: #2d5016; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
            Shop Now
          </a>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #2d5016; margin: 0; font-size: 14px; text-align: center;">
            <strong>Limited Stock:</strong> Get yours before it's gone again!
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            You're receiving this because you requested to be notified when this product is restocked.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            &copy; 2024 MushMush. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      Great News! ${productTitle} is Back in Stock!
      
      The product you requested to be notified about is now available.
      
      Shop now: ${productUrl}
      
      Don't wait too long - our fresh mushrooms sell out quickly!
      
      You're receiving this because you requested to be notified when this product is restocked.
      
      &copy; 2024 MushMush. All rights reserved.
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
        <h1 style="color: #2d5016; margin: 0;">MushMush Training Registration</h1>
        <p style="color: #666; font-size: 16px;">Professional Mushroom Cultivation Training</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #2d5016;">
        <h2 style="color: #2d5016; margin-top: 0;">Registration Confirmed! 🎉</h2>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${data.participantName}</strong>,
        </p>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Your registration for <strong>${data.programName}</strong> has been successfully confirmed. We're excited to have you join our comprehensive mushroom cultivation training program!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">Registration Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #2d5016; font-weight: bold;">${data.registrationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Program:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Fee:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">₹${data.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Status:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${data.status}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">📅 Training Timetable</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Program Duration:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programDuration}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Schedule:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programSchedule}</td>
            </tr>
            ${data.programStartDate ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Start Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programStartDate}</td>
            </tr>
            ` : ''}
            ${data.programLocation ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Location:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programLocation}</td>
            </tr>
            ` : ''}
            ${data.programInstructor ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Lead Instructor:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programInstructor}</td>
            </tr>
            ` : ''}
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
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/training" 
           style="background: #2d5016; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Training Programs
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          For any questions or assistance, please contact us:
        </p>
        <p style="color: #2d5016; font-size: 14px; margin: 5px 0;">
          📧 <a href="mailto:training@mushmush.in" style="color: #2d5016;">training@mushmush.in</a><br>
          📞 <a href="tel:+919876543210" style="color: #2d5016;">+91 98765 43210</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 10px;">
          &copy; 2024 MushMush. All rights reserved.
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
        <h1 style="color: #2d5016; margin: 0;">Payment Confirmed! 🎉</h1>
        <p style="color: #666; font-size: 16px;">MushMush Training Registration</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #28a745;">
        <h2 style="color: #28a745; margin-top: 0;">Payment Successfully Processed!</h2>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${data.participantName}</strong>,
        </p>
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Great news! Your payment for <strong>${data.programName}</strong> has been successfully processed. Your training registration is now fully confirmed and you're all set to begin your mushroom cultivation journey!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #2d5016; font-weight: bold;">${data.registrationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Program:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Amount Paid:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">₹${data.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Payment Method:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Transaction ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: monospace; font-size: 12px;">${data.upiTransactionId}</td>
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
          <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">📅 Training Timetable</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Program Duration:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programDuration}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Schedule:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programSchedule}</td>
            </tr>
            ${data.programStartDate ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Start Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programStartDate}</td>
            </tr>
            ` : ''}
            ${data.programLocation ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Training Location:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programLocation}</td>
            </tr>
            ` : ''}
            ${data.programInstructor ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Lead Instructor:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programInstructor}</td>
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
            <li>Hands-on practical training with live mushroom cultures</li>
            <li>Comprehensive study materials and resources provided</li>
            <li>Expert guidance from experienced mushroom cultivators</li>
            <li>Certificate of completion upon successful program finish</li>
            <li>Post-training support and consultation available</li>
          </ul>
        </div>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          We're incredibly excited to have you join our mushroom cultivation community! If you have any questions before the training begins, please don't hesitate to reach out to us.
        </p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/training" 
           style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Training Schedule
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          For any questions or assistance, please contact us:
        </p>
        <p style="color: #2d5016; font-size: 14px; margin: 5px 0;">
          📧 <a href="mailto:training@mushmush.in" style="color: #2d5016;">training@mushmush.in</a><br>
          📞 <a href="tel:+919876543210" style="color: #2d5016;">+91 98765 43210</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 10px;">
          &copy; 2024 MushMush. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

// Send email function - now using actual email service
export async function sendTrainingEmail(emailData: EmailData): Promise<void> {
  try {
    // Log email details for development
    console.log('📧 Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      contentLength: emailData.html.length
    });

    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ Email configuration missing. Please set SMTP_USER and SMTP_PASSWORD environment variables.');
      console.log('📧 Email would be sent to:', emailData.to);
      console.log('📧 Email subject:', emailData.subject);
      console.log('📧 Email content preview:', emailData.html.substring(0, 200) + '...');
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
      console.log('✅ Email sent successfully to:', emailData.to);
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
