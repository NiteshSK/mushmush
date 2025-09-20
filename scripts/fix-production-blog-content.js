const { PrismaClient } = require('@prisma/client');

// Full blog content (from local database)
const fullBlogContent = `
        <p>Have you ever walked through a farmers' market and admired the beautiful clusters of fresh, gourmet mushrooms, wishing you could have that kind of quality right in your own kitchen? Well, you're in luck! Growing oyster mushrooms at home is not only possible but surprisingly easy and rewarding. In this comprehensive guide, we'll walk you through everything you need to know to cultivate these delicious fungi from spore to plate.</p>
        
        <h2>Why Grow Oyster Mushrooms?</h2>
        <p>Before we dive into the how-to, let's talk about why oyster mushrooms are the perfect choice for home cultivation:</p>
        
        <ul>
            <li><strong>Fast Growing:</strong> Oyster mushrooms are one of the fastest-growing mushrooms, with some varieties ready to harvest in just 2-3 weeks</li>
            <li><strong>High Yield:</strong> They're prolific producers, giving you a generous harvest from a small growing space</li>
            <li><strong>Nutrient-Rich:</strong> Packed with protein, fiber, vitamins, and minerals, oyster mushrooms are a nutritional powerhouse</li>
            <li><strong>Versatile in Cooking:</strong> With their delicate flavor and tender texture, they're perfect for a wide variety of dishes</li>
            <li><strong>Eco-Friendly:</strong> They can be grown on agricultural waste products, making them sustainable and environmentally friendly</li>
        </ul>
        
        <h2>Understanding Oyster Mushrooms</h2>
        <p>Oyster mushrooms (<em>Pleurotus ostreatus</em>) are named for their oyster-shell-like appearance and grow in shelf-like clusters. They come in several varieties, each with its unique characteristics:</p>
        
        <h3>Common Varieties:</h3>
        <ul>
            <li><strong>Pearl Oyster:</strong> The most common variety, with pearl-white caps and a mild, delicate flavor</li>
            <li><strong>Blue Oyster:</strong> Beautiful blue-gray caps that turn brown as they mature, with a robust flavor</li>
            <li><strong>Golden Oyster:</strong> Vibrant yellow caps with a fruity aroma and delicate texture</li>
            <li><strong>King Oyster:</strong> Thick, meaty stems and small caps, perfect for grilling and roasting</li>
            <li><strong>Pink Oyster:</strong> Stunning pink color with a delicate flavor and tender texture</li>
        </ul>
        
        <h2>What You'll Need to Get Started</h2>
        <p>Before you begin your mushroom-growing journey, gather these essential supplies:</p>
        
        <h3>Basic Equipment:</h3>
        <ul>
            <li><strong>Mushroom Spawn:</strong> This is the "seed" for your mushrooms. You can buy it online or from specialty garden stores</li>
            <li><strong>Growing Substrate:</strong> The material your mushrooms will grow on. Popular options include:</li>
            <li>• Straw (pasteurized)</li>
            <li>• Coffee grounds</li>
            <li>• Sawdust or wood pellets</li>
            <li>• Cardboard</li>
            <li><strong>Growing Container:</strong> Plastic buckets, grow bags, or plastic storage containers work well</li>
            <li><strong>Spray Bottle:</strong> For maintaining humidity</li>
            <li><strong>Thermometer and Hygrometer:</strong> To monitor temperature and humidity</li>
            <li><strong>Clean Working Area:</strong> Sterility is crucial to prevent contamination</li>
        </ul>
        
        <h2>Step-by-Step Growing Guide</h2>
        
        <h3>Step 1: Prepare Your Substrate</h3>
        <p>The substrate preparation is crucial for success. Here's how to prepare straw, one of the most popular substrates for oyster mushrooms:</p>
        
        <ol>
            <li><strong>Chop the straw:</strong> Cut straw into 2-4 inch pieces</li>
            <li><strong>Pasteurize:</strong> Heat water to 160-180°F (71-82°C) and soak the straw for 1-2 hours</li>
            <li><strong>Drain and cool:</strong> Remove the straw and let it drain and cool to room temperature</li>
            <li><strong>Squeeze out excess water:</strong> The straw should be moist but not dripping wet</li>
        </ol>
        
        <p><strong>Alternative substrates:</strong> If using coffee grounds, simply collect fresh grounds and let them cool. For sawdust, moisten it to field capacity (moist but not dripping).</p>
        
        <h3>Step 2: Inoculate with Spawn</h3>
        <p>This is where you introduce the mushroom spawn to your prepared substrate:</p>
        
        <ol>
            <li><strong>Clean your hands and workspace:</strong> Wash thoroughly and consider wearing gloves</li>
            <li><strong>Break up the spawn:</strong> Gently break apart the spawn block or grain spawn</li>
            <li><strong>Mix spawn and substrate:</strong> Layer the substrate and spawn in your growing container, aiming for about 10-15% spawn by volume</li>
            <li><strong>Pack gently:</strong> Don't compress too tightly – mushrooms need air to grow</li>
        </ol>
        
        <h3>Step 3: Incubation Period</h3>
        <p>During this phase, the mycelium (mushroom "roots") will colonize the substrate:</p>
        
        <ol>
            <li><strong>Cover the container:</strong> Use a lid or plastic wrap with small holes for air exchange</li>
            <li><strong>Maintain temperature:</strong> Keep between 70-80°F (21-27°C)</li>
            <li><strong>Keep in darkness:</strong> Mycelium grows best in the dark</li>
            <li><strong>Wait for colonization:</strong> This typically takes 2-3 weeks. You'll see white, web-like growth spreading through the substrate</li>
        </ol>
        
        <h3>Step 4: Initiate Fruiting</h3>
        <p>Once the substrate is fully colonized, it's time to trigger mushroom formation:</p>
        
        <ol>
            <li><strong>Expose to light:</strong> Move to a location with indirect light (no direct sunlight)</li>
            <li><strong>Lower temperature:</strong> Reduce to 60-70°F (15-21°C)</li>
            <li><strong>Increase humidity:</strong> Maintain 85-95% humidity by misting regularly</li>
            <li><strong>Provide fresh air:</strong> Increase air exchange by opening containers or making more holes</li>
        </ol>
        
        <h3>Step 5: Harvesting</h3>
        <p>The exciting moment when you get to reap your rewards!</p>
        
        <ol>
            <li><strong>Watch for growth:</strong> Small pins will appear and grow into full mushrooms in 3-5 days</li>
            <li><strong>Harvest at the right time:</strong> Pick when the edges of the caps start to curl up slightly</li>
            <li><strong>Twist and pull:</strong> Gently twist the mushroom cluster at the base to harvest</li>
            <li><strong>Don't cut:</strong> Pulling the entire cluster encourages future flushes</li>
        </ol>
        
        <h2>Troubleshooting Common Issues</h2>
        
        <h3>Contamination</h3>
        <p>Green, black, or unusual colors indicate contamination:</p>
        <ul>
            <li><strong>Prevention:</strong> Maintain cleanliness, use pasteurized substrate, ensure good air exchange</li>
            <li><strong>Treatment:</strong> Remove contaminated areas immediately. If severe, discard the entire batch</li>
        </ul>
        
        <h3>No Mushroom Formation</h3>
        <p>If mycelium grows but no mushrooms appear:</p>
        <ul>
            <li><strong>Check environmental conditions:</strong> Ensure proper temperature, humidity, and light</li>
            <li><strong>Increase air exchange:</strong> Mushrooms need fresh air to form</li>
            <li><strong>Be patient:</strong> Sometimes it just takes a bit longer</li>
        </ul>
        
        <h3>Mushrooms Look Strange</h3>
        <p>Abnormal growth can indicate environmental issues:</p>
        <ul>
            <li><strong>Long stems, small caps:</strong> Not enough light or fresh air</li>
            <li><strong>Cracked caps:</strong> Humidity too low</li>
            <li><strong>Yellowing:</strong> Too much moisture or poor air circulation</li>
        </ul>
        
        <h2>Maximizing Your Harvest</h2>
        
        <h3>Multiple Flushes</h3>
        <p>After your first harvest, you can get additional "flushes" of mushrooms:</p>
        <ol>
            <li><strong>Rest period:</strong> Let the substrate rest for 1-2 weeks</li>
            <li><strong>Rehydrate:</strong> Soak the substrate in water for a few hours</li>
            <li><strong>Repeat fruiting conditions:</strong> Maintain proper humidity and temperature</li>
            <li><strong>Expect diminishing returns:</strong> Each flush typically produces fewer mushrooms</li>
        </ol>
        
        <h3>Storing Your Harvest</h3>
        <p>Fresh oyster mushrooms are best used immediately, but here's how to store them:</p>
        <ul>
            <li><strong>Refrigeration:</strong> Store in a paper bag in the fridge for 5-7 days</li>
            <li><strong>Drying:</strong> Dehydrate for long-term storage (up to a year)</li>
            <li><strong>Freezing:</strong> Cook first, then freeze for several months</li>
        </ul>
        
        <h2>Cooking with Oyster Mushrooms</h2>
        <p>Now that you've grown your own oyster mushrooms, here are some delicious ways to enjoy them:</p>
        
        <h3>Simple Sautéed Oyster Mushrooms</h3>
        <p><strong>Ingredients:</strong></p>
        <ul>
            <li>1 lb fresh oyster mushrooms, torn into pieces</li>
            <li>2 tablespoons butter or olive oil</li>
            <li>2 cloves garlic, minced</li>
            <li>Salt and pepper to taste</li>
            <li>Fresh herbs (thyme, parsley, or rosemary)</li>
        </ul>
        
        <p><strong>Instructions:</strong></p>
        <ol>
            <li>Heat butter or oil in a pan over medium-high heat</li>
            <li>Add mushrooms and cook until they release their liquid and it evaporates</li>
            <li>Add garlic and cook for another minute</li>
            <li>Season with salt, pepper, and herbs</li>
            <li>Serve immediately as a side dish or over pasta/rice</li>
        </ol>
        
        <h3>Oyster Mushroom "Calamari"</h3>
        <p>A fantastic vegetarian alternative to fried calamari:</p>
        <ol>
            <li>Tear oyster mushrooms into strip-like pieces</li>
            <li>Dip in batter (flour, cornstarch, spices, and liquid)</li>
            <li>Fry until golden and crispy</li>
            <li>Serve with lemon wedges and marinara sauce</li>
        </ol>
        
        <h2>Advanced Techniques</h2>
        
        <h3>Outdoor Growing</h3>
        <p>For those with outdoor space, consider these methods:</p>
        <ul>
            <li><strong>Mushroom logs:</strong> Inoculate hardwood logs with spawn plugs</li>
            <li><strong>Garden beds:</strong> Create dedicated mushroom beds in shaded areas</li>
            <li><strong>Compost integration:</strong> Add spawn to your compost pile</li>
        </ul>
        
        <h3>Scaling Up</h3>
        <p>Ready to take your mushroom growing to the next level?</p>
        <ul>
            <li><strong>Flow hood:</strong> For sterile laboratory work</li>
            <li><strong>Pressure cooker:</strong> For sterilizing substrates</li>
            <li><strong>Climate control:</strong> Automated systems for temperature and humidity</li>
            <li><strong>Commercial strains:</strong> High-yield varieties for larger operations</li>
        </ul>
        
        <h2>Sustainability and Environmental Impact</h2>
        <p>Growing oyster mushrooms at home has numerous environmental benefits:</p>
        
        <ul>
            <li><strong>Waste reduction:</strong> They grow on agricultural byproducts that would otherwise be discarded</li>
            <li><strong>Low energy consumption:</strong> Minimal energy requirements compared to traditional agriculture</li>
            <li><strong>Carbon sequestration:</strong> Mushrooms help break down organic matter and return nutrients to the soil</li>
            <li><strong>Local food production:</strong> Reduces transportation emissions and supports food security</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Growing oyster mushrooms at home is a rewarding, sustainable, and delicious hobby that anyone can master. From the excitement of seeing your first pins emerge to the satisfaction of harvesting and cooking your own homegrown mushrooms, every step of the journey is filled with wonder and learning.</p>
        
        <p>Remember that practice makes perfect, and don't be discouraged if your first attempt isn't flawless. Each growing cycle will teach you something new about these fascinating fungi. Before you know it, you'll be harvesting abundant crops of beautiful, delicious oyster mushrooms that will impress your family and friends.</p>
        
        <p>So why wait? Start your mushroom-growing adventure today and discover the joy of cultivating your own gourmet mushrooms from spore to plate!</p>
        
        <h2>Additional Resources</h2>
        <ul>
            <li><strong>Books:</strong> "Organic Mushroom Farming and Mycoremediation" by Tradd Cotter</li>
            <li><strong>Online Communities:</strong> Reddit's r/MushroomGrowers, various Facebook groups</li>
            <li><strong>Suppliers:</strong> Field & Forest, North Spore, Out-Grow</li>
            <li><strong>YouTube Channels:</strong> Fresh Cap, Mushroom Adventures, Let's Grow Mushrooms</li>
        </ul>
        
        <p>Happy growing, and enjoy your delicious homegrown oyster mushrooms!</p>
`;

async function fixProductionBlogContent() {
  console.log('🔧 Fixing blog content in production database...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is required');
    console.error('Please run: DATABASE_URL="your_production_db_url" node scripts/fix-production-blog-content.js');
    return;
  }

  console.log(`📡 Connecting to production database...`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    // Check current content first
    console.log('📊 Checking current blog content...');
    const currentPost = await prisma.blogPost.findFirst({
      select: {
        id: true,
        title: true,
        content: true,
        views: true
      }
    });

    if (!currentPost) {
      console.log('❌ No blog post found in production database');
      return;
    }

    console.log(`📝 Current blog post:`);
    console.log(`   ID: ${currentPost.id}`);
    console.log(`   Title: ${currentPost.title}`);
    console.log(`   Current views: ${currentPost.views || 0}`);
    console.log(`   Current content length: ${currentPost.content ? currentPost.content.length : 0} characters`);
    console.log(`   Current content: "${currentPost.content}"`);

    // Update with full content
    console.log(`\n🔄 Updating blog post with full content...`);
    console.log(`   New content length: ${fullBlogContent.length} characters`);

    const updatedPost = await prisma.blogPost.update({
      where: { id: currentPost.id },
      data: {
        content: fullBlogContent,
        views: 0
      }
    });

    console.log(`\n✅ Blog post updated successfully!`);
    console.log(`   Post ID: ${updatedPost.id}`);
    console.log(`   Title: ${updatedPost.title}`);
    console.log(`   Views reset to: ${updatedPost.views}`);
    console.log(`   New content length: ${updatedPost.content ? updatedPost.content.length : 0} characters`);
    
    // Show a preview of the new content
    const preview = updatedPost.content.substring(0, 200);
    console.log(`   Content preview: ${preview}...`);

    console.log(`\n🎉 The blog content truncation issue has been fixed!`);
    console.log(`   The full blog content (${updatedPost.content.length} characters) is now stored in the production database.`);
    console.log(`   Views have been reset to 0 for accurate tracking.`);

  } catch (error) {
    console.error('❌ Error fixing blog content:', error.message);
    console.error('Make sure your DATABASE_URL is correct and you have proper permissions');
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionBlogContent();
