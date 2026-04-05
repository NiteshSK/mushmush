import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(unsubscribePage("Invalid unsubscribe link.", request.url), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  try {
    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return new Response(
      unsubscribePage("You've been successfully unsubscribed from the Kosvana newsletter.", request.url),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new Response(
      unsubscribePage("This email is not subscribed to our newsletter.", request.url),
      { headers: { "Content-Type": "text/html" }, status: 404 }
    );
  }
}

function unsubscribePage(message: string, requestUrl?: string): string {
  let baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  if (requestUrl) {
    try { const u = new URL(requestUrl); baseUrl = u.origin; } catch {}
  }
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Unsubscribe — Kosvana</title></head>
    <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #faf9f6;">
      <div style="text-align: center; max-width: 400px; padding: 40px;">
        <h1 style="color: #5c8e61; font-size: 24px; margin-bottom: 12px;">Kosvana</h1>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${message}</p>
        <a href="${baseUrl}" style="color: #5c8e61; text-decoration: underline; font-size: 14px;">Back to Kosvana</a>
      </div>
    </body>
    </html>
  `;
}
