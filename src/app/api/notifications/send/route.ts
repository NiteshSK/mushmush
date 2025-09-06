import { NextRequest, NextResponse } from 'next/server';
import { sendRestockNotifications } from '@/lib/notifications';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  productId: z.number().int().positive('Invalid product ID'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = sendNotificationSchema.parse(body);

    const result = await sendRestockNotifications(productId);

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        results: result.results
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
