import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/get-base-url";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 subscriptions per IP per hour
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = rateLimit(`newsletter:${ip}`, { max: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert: reactivate if previously unsubscribed, or create new
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        isActive: true,
        unsubscribedAt: null,
      },
      create: {
        email: normalizedEmail,
      },
    });

    // Send welcome email (non-blocking)
    const baseUrl = request.headers.get('origin') || getAppUrl();
    sendEmail({
      to: normalizedEmail,
      subject: "Welcome to the Kosvana Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5c8e61; margin: 0;">You're In!</h1>
            <p style="color: #666; font-size: 16px;">Welcome to the Kosvana community</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Thank you for subscribing to the Kosvana newsletter! You'll be the first to know about:
            </p>
            <ul style="color: #333; line-height: 1.8; margin-left: 20px;">
              <li>New product launches</li>
              <li>Exclusive offers & discounts</li>
              <li>Recipes & wellness tips</li>
              <li>Training program updates</li>
            </ul>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${baseUrl}/shop"
               style="background: #5c8e61; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Shop Now
            </a>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              Don't want these emails? <a href="${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(normalizedEmail)}" style="color: #5c8e61;">Unsubscribe</a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 10px;">
              &copy; ${new Date().getFullYear()} Kosvana by Mush Agro Products. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }).catch((err) => console.error("Newsletter welcome email failed:", err));

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
