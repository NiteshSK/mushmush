import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const RSS_SOURCES = [
  {
    name: 'Google News - Mushrooms',
    url: 'https://news.google.com/rss/search?q=mushroom+cultivation+OR+medicinal+mushrooms+OR+edible+mushrooms&hl=en-US&gl=US&ceid=US:en',
  },
  {
    name: 'Google News - Fungi',
    url: 'https://news.google.com/rss/search?q=fungi+OR+mycelium+research&hl=en-US&gl=US&ceid=US:en',
  },
];

const MUSHROOM_KEYWORDS = [
  'mushroom', 'fungi', 'mycelium', 'cultivation', 'medicinal',
  'edible', 'shiitake', 'oyster', 'reishi', 'lion\'s mane',
  'cordyceps', 'turkey tail', 'chaga', 'maitake'
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

// Track used images to avoid duplicates in same scraping session
const usedImages = new Set<string>();

async function fetchArticleImage(url: string): Promise<string> {
    try {
      const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
      
      if (UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'YOUR_ACCESS_KEY_HERE') {
        // Get recently used images from database
        const recentNews = await prisma.news.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          select: { img: true }
        });
        
        const usedImageUrls = new Set(recentNews.map(n => n.img));
        
        // Try up to 5 times to get a unique image
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const response = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
              query: 'mushroom fungi',
              orientation: 'landscape',
              count: 1,
              per_page: 30,
              page: Math.floor(Math.random() * 10) + 1,
            },
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
              'Accept-Version': 'v1',
            },
            timeout: 8000,
          });
          
          if (response.data && response.data[0] && response.data[0].urls) {
            const imageUrl = response.data[0].urls.regular;
            
            // Check if this image was already used
            if (!usedImageUrls.has(imageUrl)) {
              console.log(`✅ Got unique Unsplash image (attempt ${attempt + 1})`);
              return imageUrl;
            }
            
            console.log(`⚠️ Image already used, retrying... (attempt ${attempt + 1})`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Unsplash API failed`);
    }
    
    // Fallback: Use curated images with database check
    const mushroomImages = [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80',
      'https://images.unsplash.com/photo-1612522228017-a2b6e5a8e7e0?w=800&q=80',
      'https://images.unsplash.com/photo-1456324463128-7ff6903988d8?w=800&q=80',
      'https://images.unsplash.com/photo-1595587637401-f8f03d3d1b7e?w=800&q=80',
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=800&q=80',
      'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&q=80',
      'https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?w=800&q=80',
    ];
    
    // Get used images from database
    const recentNews = await prisma.news.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: { img: true }
    });
    
    const usedUrls = new Set(recentNews.map(n => n.img));
    const availableImages = mushroomImages.filter(img => !usedUrls.has(img));
    
    if (availableImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      return availableImages[randomIndex];
    }
    
    // If all used, pick random
    const index = Math.floor(Math.random() * mushroomImages.length);
    return mushroomImages[index];
  }

function createEnhancedContent(title: string, description: string, sourceUrl: string): { content: string; excerpt: string } {
  const cleanDesc = description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #333;">
      <div style="background: linear-gradient(135deg, #f6f8fb 0%, #f1f5f9 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <p style="font-size: 17px; line-height: 1.8; color: #2d3748; margin: 0;">${cleanDesc}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);">
          🔗 Read Full Article on Original Source →
        </a>
      </div>

      <div style="border-top: 3px solid #667eea; margin: 32px 0; padding-top: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #2d3748; margin-bottom: 16px;">📰 About This Article</h2>
        <p style="font-size: 15px; color: #555; margin-bottom: 16px;"><strong>${title}</strong></p>
        <p style="font-size: 15px; color: #555;">This article from a leading news source provides the latest insights and developments in mushroom science, cultivation, and applications.</p>
      </div>
    </div>
  `;

  const excerpt = cleanDesc.substring(0, 200).trim() + (cleanDesc.length > 200 ? '...' : '');
  return { content: htmlContent, excerpt };
}

export async function POST(request: NextRequest) {
  let savedArticles = 0;
  let totalArticles = 0;

  try {
    console.log('🔍 Starting news scraping...');

    for (const source of RSS_SOURCES) {
      const response = await axios.get(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items = $('item');

      for (let i = 0; i < Math.min(items.length, 3); i++) {
        const item = items[i];
        const title = $(item).find('title').text().trim();
        const link = $(item).find('link').text().trim();
        const description = $(item).find('description').text().trim();
        const pubDate = $(item).find('pubDate').text().trim();

        const isMushroomRelated = MUSHROOM_KEYWORDS.some(keyword => 
          title.toLowerCase().includes(keyword) || 
          description.toLowerCase().includes(keyword)
        );

        if (!isMushroomRelated) continue;

        totalArticles++;

        const existingNews = await prisma.news.findFirst({
          where: {
            OR: [
              { slug: generateSlug(title) },
              { title: title }
            ]
          }
        });

        if (existingNews) continue;

        const { content, excerpt } = createEnhancedContent(title, description, link);
        const img = await fetchArticleImage(link);

        await prisma.news.create({
            data: {
              title: title.substring(0, 200),
              slug: generateSlug(title),
              content,
              excerpt,
              img,
              sourceUrl: link,
              source: 'manual', // Add this line
              published: true,
              createdAt: pubDate ? new Date(pubDate) : new Date(),
            }
          });

        savedArticles++;
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      totalArticles,
      savedArticles,
      message: `Scraped ${savedArticles} new articles`
    });

  } catch (error) {
    console.error('Scraping error:', error);
    await prisma.$disconnect();
    
    return NextResponse.json(
      { error: 'Scraping failed', details: error.message },
      { status: 500 }
    );
  }
}