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
            © 2024 MushMush. All rights reserved.
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
      
      © 2024 MushMush. All rights reserved.
    `
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
            © 2024 MushMush. All rights reserved.
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
      
      © 2024 MushMush. All rights reserved.
    `
  })
};
