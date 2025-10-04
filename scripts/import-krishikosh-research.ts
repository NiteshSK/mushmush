import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

// Main import function
async function importKrishiKoshResearch() {
  console.log('\n🔬 KrishiKosh Research Paper Import Tool\n');
  console.log('This tool helps you manually add research papers from KrishiKosh to your news section.\n');
  console.log('📚 Visit: https://krishikosh.egranth.ac.in/simple-search?query=mushroom\n');
  console.log('='.repeat(80) + '\n');

  try {
    // Get research paper details
    const title = await question('📝 Enter research paper title: ');
    
    if (!title || title.trim().length === 0) {
      console.log('❌ Title is required!');
      rl.close();
      return;
    }

    const authors = await question('👥 Enter author(s) name (optional): ');
    const year = await question('📅 Enter publication year (optional): ');
    const abstract = await question('📄 Enter abstract/summary (paste the full abstract): ');
    const sourceUrl = await question('🔗 Enter KrishiKosh URL (optional): ');
    const keywords = await question('🏷️  Enter keywords (comma-separated, optional): ');

    // Generate slug
    const slug = generateSlug(title);

    // Check for duplicates
    const existing = await prisma.news.findFirst({
      where: {
        OR: [
          { slug: slug },
          { title: title }
        ]
      }
    });

    if (existing) {
      console.log('\n⚠️  Warning: A similar article already exists!');
      const overwrite = await question('Do you want to continue anyway? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Import cancelled.');
        rl.close();
        return;
      }
    }

    // Create formatted content
    const formattedContent = createResearchContent(title, authors, year, abstract, sourceUrl, keywords);
    const excerpt = abstract.substring(0, 200).trim() + (abstract.length > 200 ? '...' : '');

    // Select image
    console.log('\n🖼️  Select an image option:');
    console.log('1. Use default mushroom research image');
    console.log('2. Enter custom image URL');
    const imageChoice = await question('Enter choice (1 or 2): ');

    let imageUrl = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80'; // Research/lab image
    
    if (imageChoice === '2') {
      const customImage = await question('Enter image URL: ');
      if (customImage && customImage.startsWith('http')) {
        imageUrl = customImage;
      }
    }

    // Create the news article
    const newsArticle = await prisma.news.create({
      data: {
        title: title.substring(0, 200),
        slug: slug,
        content: formattedContent,
        excerpt: excerpt,
        img: imageUrl,
        published: true,
        createdAt: year ? new Date(`${year}-01-01`) : new Date(),
      }
    });

    console.log('\n✅ Research paper successfully imported!');
    console.log(`📰 Title: ${newsArticle.title}`);
    console.log(`🔗 Slug: ${newsArticle.slug}`);
    console.log(`📅 Date: ${newsArticle.createdAt.toLocaleDateString()}`);
    console.log(`\n🌐 View at: http://localhost:3000/news/${newsArticle.slug}`);

    // Ask if user wants to import another
    const another = await question('\nDo you want to import another research paper? (yes/no): ');
    if (another.toLowerCase() === 'yes') {
      await importKrishiKoshResearch();
    } else {
      console.log('\n👋 Thank you for using KrishiKosh Import Tool!\n');
      rl.close();
    }

  } catch (error) {
    console.error('❌ Error importing research paper:', error);
    rl.close();
  }
}

// Create formatted HTML content for research paper
function createResearchContent(
  title: string, 
  authors: string, 
  year: string, 
  abstract: string, 
  sourceUrl: string,
  keywords: string
): string {
  const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [];
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #333;">
      
      ${authors ? `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #0284c7;">
          <p style="margin: 0; color: #0c4a6e;">
            <strong>Authors:</strong> ${authors}
            ${year ? ` | <strong>Year:</strong> ${year}` : ''}
          </p>
        </div>
      ` : ''}

      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px;">📄 Abstract</h3>
        <p style="margin: 0; color: #78350f; line-height: 1.8;">${abstract}</p>
      </div>

      ${keywordList.length > 0 ? `
        <div style="margin: 24px 0;">
          <h3 style="font-size: 18px; color: #2d3748; margin-bottom: 12px;">🏷️ Keywords</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${keywordList.map(keyword => `
              <span style="background: #e0e7ff; color: #3730a3; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                ${keyword}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="border-top: 3px solid #667eea; margin: 32px 0; padding-top: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #2d3748; margin-bottom: 16px;">📚 About This Research</h2>
        <p style="font-size: 15px; color: #555; margin-bottom: 16px;"><strong>${title}</strong></p>
        <p style="font-size: 15px; color: #555;">This research paper from KrishiKosh (Indian National Agricultural Research System) provides valuable insights into mushroom cultivation, biology, and applications. KrishiKosh is a digital repository of Indian agricultural research and education.</p>
      </div>

      ${sourceUrl ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
            📖 Read Full Research Paper on KrishiKosh →
          </a>
        </div>
      ` : ''}

      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #16a34a;">
        <h3 style="margin: 0 0 12px 0; color: #14532d; font-size: 18px;">💡 Research Impact</h3>
        <p style="margin: 0; color: #15803d; line-height: 1.8;">This research contributes to the growing body of knowledge on mushroom cultivation and applications in India. Such studies help farmers, researchers, and entrepreneurs develop better cultivation practices and explore new opportunities in the mushroom industry.</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px;">
        <p style="font-size: 13px; color: #a0aec0; font-style: italic; text-align: center;">
          Research paper from KrishiKosh - Indian National Agricultural Research System
        </p>
      </div>
    </div>
  `;
}

// Run the import tool
importKrishiKoshResearch()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  