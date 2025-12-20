import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SCRAPE_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    // Retention Policy: Delete news older than 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await prisma.news.deleteMany({
      where: {
        createdAt: {
          lt: threeMonthsAgo
        }
      }
    });
    console.log('🧹 Cleaned up news older than 3 months');

    // Check if we have recent SCRAPED news (last 24 hours)
    const recentScrapedNews = await prisma.news.findFirst({
      where: {
        source: 'scraped', // Only check scraped news
        createdAt: {
          gte: new Date(Date.now() - SCRAPE_COOLDOWN)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (recentScrapedNews) {
      const timeSinceLastScrape = Date.now() - recentScrapedNews.createdAt.getTime();
      const hoursRemaining = Math.ceil((SCRAPE_COOLDOWN - timeSinceLastScrape) / (60 * 60 * 1000));

      return NextResponse.json({
        message: 'Scraping cooldown active',
        hoursRemaining,
        shouldScrape: false,
        lastScraped: recentScrapedNews.createdAt
      });
    }

    // Trigger scraping
    console.log('🚀 Triggering news scraping...');

    fetch(`${request.nextUrl.origin}/api/admin/scrape-news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('Scraping error:', err));

    return NextResponse.json({
      message: 'News scraping triggered',
      status: 'running',
      shouldScrape: true
    });

  } catch (error) {
    console.error('Error triggering scrape:', error);
    return NextResponse.json(
      { error: 'Failed to trigger scraping', details: error.message },
      { status: 500 }
    );
  }
}