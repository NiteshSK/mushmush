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
          <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">📋 Registration Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Registration Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.registrationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Program Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${data.programName}</td>
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
    let baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    invoiceDownloadUrl = `${baseUrl}${data.invoicePdfUrl}`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); padding: 30px; border-radius: 10px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Completed! 🎉</h1>
        <p style="color: #e8f5e8; font-size: 16px; margin-top: 10px;">Thank you for your purchase</p>
      </div>
      
      <!-- Order Details -->
      <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">Order Details</h2>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Dear <strong>${data.customerName}</strong>,
        </p>
        
        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
          Your order has been successfully completed and is ready for delivery! We've attached your invoice for your records.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Order Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #2d5016; font-weight: bold;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">Invoice Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #2d5016; font-weight: bold;">${data.invoiceNumber}</td>
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
        <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">Order Items</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2d5016; color: #2d5016;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #2d5016; color: #2d5016;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #2d5016; color: #2d5016;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #2d5016; color: #2d5016;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.orderItems.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${item.productTitle}</td>
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
          <tr>
            <td style="padding: 8px 0; text-align: right; color: #555;">Tax:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${data.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; text-align: right; color: #555;">Shipping:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${data.shipping.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #2d5016;">
            <td style="padding: 12px 0; text-align: right; color: #2d5016; font-size: 18px; font-weight: bold;">Total:</td>
            <td style="padding: 12px 0; text-align: right; color: #2d5016; font-size: 18px; font-weight: bold;">₹${data.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <!-- Shipping Address -->
      <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #2d5016; margin-top: 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">Shipping Address</h3>
        <p style="color: #333; line-height: 1.6; margin: 0;">
          ${data.shippingAddress.address || ''}<br>
          ${data.shippingAddress.city || ''}, ${data.shippingAddress.state || ''} ${data.shippingAddress.zipCode || ''}<br>
          ${data.shippingAddress.country || 'India'}
        </p>
      </div>
      
      <!-- Download Invoice Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invoiceDownloadUrl}" 
           style="background: #2d5016; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
          📄 Download Invoice
        </a>
      </div>
      
      <!-- What's Next -->
      <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #2d5016;">
        <h4 style="color: #2d5016; margin-top: 0;">📦 What's Next?</h4>
        <ul style="color: #2d5016; line-height: 1.8; margin-left: 20px;">
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
        <p style="color: #2d5016; font-size: 14px; margin: 5px 0;">
          📧 <a href="mailto:mushagroprod@gmail.com" style="color: #2d5016; text-decoration: none;">mushagroprod@gmail.com</a><br>
          📞 <a href="tel:+917618362662" style="color: #2d5016; text-decoration: none;">+91-7618362662</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} MushMush by Mush Agro Products. All rights reserved.
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
      console.log('✅ Order invoice email sent successfully to:', data.customerEmail);
    } else {
      console.error('❌ Order invoice email failed:', result.error);
    }
  } catch (error) {
    console.error('Error sending order invoice email:', error);
    // Don't throw - email failure shouldn't break the order completion
  }
}

// ============================================
// OTP EMAIL FUNCTIONS
// ============================================

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP email HTML
 */
export function generateOTPEmail(otp: string, customerName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); padding: 30px; border-radius: 10px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Verify Your Order</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">MushMush - Fresh Mushrooms</p>
      </div>

      <!-- Content -->
      <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Hello ${customerName},
        </p>

        <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
          To complete your order, please use the following One-Time Password (OTP):
        </p>

        <!-- OTP Box -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #2d5016; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
          <p style="font-size: 42px; font-weight: bold; color: #2d5016; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
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
          <strong>MushMush - Fresh Edible and Medicinal Mushrooms</strong>
        </p>
        <p style="margin: 0 0 5px 0;">
          📧 Email: mushagroprod@gmail.com | 📞 Phone: +91-7618362662
        </p>
        <p style="margin: 10px 0 0 0; color: #999;">
          © ${new Date().getFullYear()} MushMush. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email: string, otp: string, customerName: string) {
  try {
    const emailData: EmailOptions = {
      to: email,
      subject: `Your OTP for Order Verification - ${otp}`,
      html: generateOTPEmail(otp, customerName),
      text: `Your OTP for order verification is: ${otp}. This OTP is valid for 10 minutes.`
    };

    const result = await sendEmail(emailData);

    if (result.success) {
      console.log('✅ OTP email sent successfully to:', email);
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
