import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/site-settings - Get current site settings (public)
export async function GET() {
  try {
    // Get the first (and only) site settings record
    const settings = await prisma.$queryRaw`
      SELECT enable_festive_effects FROM site_settings LIMIT 1
    ` as any[];

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        enableFestiveEffects: false
      });
    }

    return NextResponse.json({
      enableFestiveEffects: settings[0].enable_festive_effects
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    // Return default settings on error
    return NextResponse.json({
      enableFestiveEffects: false
    });
  }
}
