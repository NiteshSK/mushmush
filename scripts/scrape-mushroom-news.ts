import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const RSS_SOURCES = [
    {
      name: 'Google News - Mushrooms',
      url: 'https://news.google.com/rss/search?q=mushroom+cultivation+OR+medicinal+mushrooms+OR+edible+mushrooms&hl=en-US&gl=US&ceid=US:en',
      type: 'rss'
    },
    {
      name: 'Google News - Fungi',
      url: 'https://news.google.com/rss/search?q=fungi+OR+mycelium+research&hl=en-US&gl=US&ceid=US:en',
      type: 'rss'
    },
    {
      name: 'KrishiKosh - Agricultural Research',
      url: 'https://krishikosh.egranth.ac.in/handle/1/2/discover?filtertype=subject&filter_relational_operator=equals&filter=Mushroom',
      type: 'web',
      searchUrl: 'https://krishikosh.egranth.ac.in/simple-search?query=mushroom'
    },
  ];

const MUSHROOM_KEYWORDS = [
  'mushroom', 'fungi', 'mycelium', 'cultivation', 'medicinal',
  'edible', 'shiitake', 'oyster', 'reishi', 'lion\'s mane',
  'cordyceps', 'turkey tail', 'chaga', 'maitake'
];

// Enhanced content creation from RSS feed - UNIQUE for each article
function createEnhancedContent(title: string, description: string, sourceUrl: string): { content: string; excerpt: string } {
    const cleanDesc = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  
    // Create well-formatted HTML content with UNIQUE description
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #333;">
        
        <div style="background: linear-gradient(135deg, #f6f8fb 0%, #f1f5f9 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <p style="font-size: 17px; line-height: 1.8; color: #2d3748; margin: 0;">${cleanDesc}</p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
            🔗 Read Full Article on Original Source →
          </a>
        </div>
  
        <div style="border-top: 3px solid #667eea; margin: 32px 0; padding-top: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #2d3748; margin-bottom: 16px;">📰 About This Article</h2>
          <p style="font-size: 15px; color: #555; margin-bottom: 16px;"><strong>${title}</strong></p>
          <p style="font-size: 15px; color: #555;">This article from a leading news source provides the latest insights and developments in mushroom science, cultivation, and applications. Click the button above to read the complete article with detailed information, expert analysis, and research findings.</p>
        </div>
  
        <div style="border-top: 2px solid #e2e8f0; margin: 32px 0; padding-top: 24px;">
          <h3 style="font-size: 22px; font-weight: 700; color: #2d3748; margin-bottom: 16px; text-align: center;">📖 Want to Read More?</h3>
          <p style="font-size: 15px; color: #555; text-align: center; margin-bottom: 24px;">Get the complete story with detailed information, expert interviews, research citations, and in-depth analysis from the original publication.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
              🔗 Read Full Article on Original Source →
            </a>
          </div>
        </div>
  
        <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px;">
          <p style="font-size: 13px; color: #a0aec0; font-style: italic; text-align: center;">Summary based on: "${title}"</p>
        </div>
      </div>
    `;
  
    const excerpt = cleanDesc.substring(0, 200).trim() + (cleanDesc.length > 200 ? '...' : '');
  
    return { content: htmlContent, excerpt };
  }

// Fetch random mushroom images from Unsplash Official API
async function fetchArticleImage(url: string): Promise<string> {
    try {
      console.log(`      🖼️  Fetching random mushroom image from Unsplash API...`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased to 1 second
      
      const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
      
      if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        console.log(`      ⚠️  No Unsplash API key found, using fallback images`);
        throw new Error('No API key configured');
      }
      
      // Add random seed to force different images
      const randomSeed = Math.random().toString(36).substring(7);
      
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          query: 'mushroom fungi',
          orientation: 'landscape',
          count: 1,
          // Add these to force different results
          featured: true,
          content_filter: 'high',
          // Random seed to prevent caching
          _: Date.now() + randomSeed
        },
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
        timeout: 8000,
      });
      
      if (response.data && response.data[0] && response.data[0].urls) {
        const imageUrl = response.data[0].urls.regular;
        console.log(`      ✅ Got random Unsplash image: ${imageUrl.substring(0, 60)}...`);
        return imageUrl;
      }
      
      console.log(`      ⚠️  Unexpected API response format`);
      throw new Error('Invalid API response');
      
    } catch (error) {
      console.error(`      ❌ Unsplash API failed: ${error.message}`);
      if (error.response) {
        console.error(`      📊 API Response Status: ${error.response.status}`);
        console.error(`      📊 API Response Data:`, error.response.data);
      }
    }
    
    // Fallback to curated images with TRUE randomization
    console.log(`      🎨 Using fallback curated images`);
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
    
    // Shuffle and pick random
    const shuffled = mushroomImages.sort(() => Math.random() - 0.5);
    return shuffled[Math.floor(Math.random() * shuffled.length)];
  }


async function scrapeNews() {
  console.log('🔍 Starting mushroom news scraping...\n');
  
  let totalArticles = 0;
  let savedArticles = 0;
  let errors = 0;

  for (const source of RSS_SOURCES) {
    try {
      console.log(`📡 Fetching from ${source.name}...`);
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items = $('item');
      
      console.log(`✅ Found ${items.length} articles from ${source.name}`);

      for (let i = 0; i < items.length && i < 3; i++) {
        const item = items[i];
        const title = $(item).find('title').text().trim();
        const link = $(item).find('link').text().trim();
        const description = $(item).find('description').text().trim();
        const pubDate = $(item).find('pubDate').text().trim();

        const isMushroomRelated = MUSHROOM_KEYWORDS.some(keyword => 
          title.toLowerCase().includes(keyword) || 
          description.toLowerCase().includes(keyword)
        );

        if (!isMushroomRelated) {
          continue;
        }

        totalArticles++;
        console.log(`\n   📰 Processing: ${title.substring(0, 60)}...`);

        const existingNews = await prisma.news.findFirst({
          where: {
            OR: [
              { slug: generateSlug(title) },
              { title: title }
            ]
          }
        });

        if (existingNews) {
          console.log(`   ⏭️  Skipping duplicate`);
          continue;
        }

        console.log(`   📝 Creating enhanced content...`);
        const { content, excerpt } = createEnhancedContent(title, description, link);
        
        console.log(`   🖼️  Fetching article image...`);
        const img = await fetchArticleImage(link);
        
        console.log(`   ✅ Content ready: ${content.length} characters`);

        const newsArticle: any = {
          title: title.substring(0, 200),
          slug: generateSlug(title),
          content: content,
          excerpt: excerpt,
          img: img,
          sourceUrl: link,
          source: 'scraped',
          published: true,
          createdAt: pubDate ? new Date(pubDate) : new Date(),
        };

        try {
          await prisma.news.create({
            data: newsArticle
          });
          
          savedArticles++;
          console.log(`   ✅ Saved to database!`);
        } catch (dbError) {
          console.error(`   ❌ Database error: ${dbError.message}`);
          errors++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

    } catch (error) {
      console.error(`❌ Error scraping ${source.name}:`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Scraping Summary:');
  console.log(`   Total mushroom articles found: ${totalArticles}`);
  console.log(`   Articles saved to database: ${savedArticles}`);
  console.log(`   Errors encountered: ${errors}`);
  console.log('\n✅ Scraping completed!\n');

  await prisma.$disconnect();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

scrapeNews()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });