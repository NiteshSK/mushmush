import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/site-settings - Get current site settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the first (and only) site settings record
    const settings = await prisma.$queryRaw`
      SELECT * FROM site_settings LIMIT 1
    ` as any[];

    if (settings.length === 0) {
      // Create default settings if none exist
      const defaultSettings = await prisma.$queryRaw`
        INSERT INTO site_settings (enable_festive_effects, created_at, updated_at)
        VALUES (false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      ` as any[];
      
      return NextResponse.json(defaultSettings[0]);
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/site-settings - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enableFestiveEffects, festiveEffectsStartDate, festiveEffectsEndDate } = await request.json();

    // Update the site settings
    const updatedSettings = await prisma.$queryRaw`
      UPDATE site_settings 
      SET 
        enable_festive_effects = ${enableFestiveEffects},
        festive_effects_start_date = ${festiveEffectsStartDate ? new Date(festiveEffectsStartDate) : null},
        festive_effects_end_date = ${festiveEffectsEndDate ? new Date(festiveEffectsEndDate) : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *
    ` as any[];

    if (updatedSettings.length === 0) {
      // If no settings exist, create them
      const newSettings = await prisma.$queryRaw`
        INSERT INTO site_settings (enable_festive_effects, festive_effects_start_date, festive_effects_end_date, created_at, updated_at)
        VALUES (${enableFestiveEffects}, ${festiveEffectsStartDate ? new Date(festiveEffectsStartDate) : null}, ${festiveEffectsEndDate ? new Date(festiveEffectsEndDate) : null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      ` as any[];
      
      return NextResponse.json(newSettings[0]);
    }

    return NextResponse.json(updatedSettings[0]);
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
