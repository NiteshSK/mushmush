import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding blog post...')

  // Check current view count before resetting
  const existingPost = await prisma.blogPost.findUnique({
    where: { slug: 'growing-oyster-mushrooms-guide' }
  })
  
  if (existingPost) {
    console.log('📊 Current blog post stats:')
    console.log('   Title:', existingPost.title)
    console.log('   Current views:', existingPost.views)
    console.log('   Published:', existingPost.published)
    console.log('🔄 Resetting views to 0...')
  }

  const blogPost = await prisma.blogPost.upsert({
    where: { slug: 'growing-oyster-mushrooms-guide' },
    update: {
      views: 0, // Reset views to 0
      published: true, // Ensure it's published
      excerpt: 'Have you ever walked through a farmers\' market and admired the beautiful clusters of fresh, gourmet mushrooms, wishing you could have that kind of quality right in your own kitchen? Well, you can! Meet the oyster mushroom—a delicious, versatile, and incredibly nutritious fungus that is surprisingly easy to grow at home.',
      content: `
        <p>Have you ever walked through a farmers' market and admired the beautiful clusters of fresh, gourmet mushrooms, wishing you could have that kind of quality right in your own kitchen? Well, you can! Meet the oyster mushroom—a delicious, versatile, and incredibly nutritious fungus that is surprisingly easy to grow at home.</p>
        
        <p>Whether you're a seasoned gardener or a complete beginner, this guide will walk you through everything you need to know, from the amazing health benefits to the simple steps for cultivating your very own mushroom harvest in a controlled environment.</p>
        
        <h3>Why Grow Oyster Mushrooms? The Health Advantages</h3>
        <ul>
          <li><strong>A Nutrient Powerhouse:</strong> Oyster mushrooms are packed with essential nutrients while being low in calories. They are an excellent source of plant-based protein, fiber, B vitamins (like niacin and riboflavin), and important minerals like potassium.</li>
          <li><strong>Immune System Support:</strong> They contain special compounds called beta-glucans, which are known to help modulate and strengthen the immune system, keeping your body's defenses strong.</li>
          <li><strong>Heart Health Hero:</strong> Studies have shown that oyster mushrooms can help maintain healthy cholesterol levels, making them a heart-friendly addition to any diet.</li>
          <li><strong>Rich in Antioxidants:</strong> They are a great source of antioxidants, such as ergothioneine, which help protect your body's cells from damage and oxidative stress.</li>
        </ul>
        
        <h3>How to Grow at Home (Without a Kit)</h3>
        <p>Growing oyster mushrooms without a pre-made kit is a deeply rewarding project. The method we'll use involves pasteurizing a substrate with boiling water to eliminate most contaminants, giving your mushroom mycelium a clean slate to thrive.</p>
        
        <h4>Materials You'll Need:</h4>
        <ul>
          <li><strong>Oyster Mushroom Spawn:</strong> This is live mushroom mycelium, usually on a grain or sawdust carrier. You can buy this online.</li>
          <li><strong>Substrate:</strong> Chopped straw or hardwood sawdust are excellent choices for beginners.</li>
          <li><strong>Large Pot:</strong> For boiling and pasteurizing your substrate.</li>
          <li><strong>Strainer or Mesh Bag:</strong> A clean pillowcase also works well for draining.</li>
          <li><strong>Grow Bags:</strong> Special mushroom grow bags with filter patches are ideal, but clean plastic buckets with drilled holes can also be used.</li>
          <li><strong>Isopropyl Alcohol (70%):</strong> For sanitizing surfaces and your hands.</li>
        </ul>
        
        <h4>What's the Cost? A Quick Breakdown</h4>
        <p>One of the best parts of this DIY method is its affordability. Here's a rough estimate of the initial costs (prices in Dehradun may vary):</p>
        <ul>
          <li><strong>Oyster Mushroom Spawn:</strong> A 1kg bag of quality spawn will cost around ₹200 - ₹300 and is enough for several grow bags.</li>
          <li><strong>Substrate (Straw):</strong> This is very cheap. A large bundle of straw from a local supplier might cost ₹50 - ₹100.</li>
          <li><strong>Grow Bags:</strong> These are also inexpensive, typically costing ₹10 - ₹20 per bag.</li>
        </ul>
        <p>Your initial investment could be as low as <strong>₹400 - ₹500</strong>, which will yield several kilograms of fresh, organic mushrooms over multiple harvests—far cheaper than buying them at the market!</p>
        
        <h4>Step 1: Prepare and Pasteurize the Substrate</h4>
        <ol>
          <li><strong>Chop the Substrate:</strong> If using straw, cut it into 1-3 inch pieces. This increases the surface area for the mycelium to colonize.</li>
          <li><strong>Boil and Simmer:</strong> Place your substrate in the large pot, cover it with water, and bring to a boil. Let it simmer for 60-90 minutes to pasteurize it.</li>
          <li><strong>Drain and Cool:</strong> Carefully drain all the hot water. Spread the substrate on a clean, sanitized surface to cool down to room temperature. This can take a few hours.</li>
          <li><strong>Check Moisture (The Squeeze Test):</strong> Once cool, grab a handful and squeeze firmly. Only a few drops of water should come out. If it streams water, it's too wet. If nothing comes out, it's too dry and needs a light misting.</li>
        </ol>
        
        <h4>Step 2: Inoculation (Mixing Spawn and Substrate)</h4>
        <p>This is where you introduce the mycelium to its food source. Cleanliness is critical here!</p>
        <ol>
          <li><strong>Sanitize Everything:</strong> Wipe down your work surface, grow bags, and wash your hands thoroughly with 70% isopropyl alcohol.</li>
          <li><strong>Mix Thoroughly:</strong> In a clean tub or directly in your grow bag, layer and mix your cooled substrate with the spawn. A good ratio is about 5-10% spawn to substrate by weight. Ensure it's evenly distributed.</li>
        </ol>
        
        <h4>Step 3: Incubation (Colonization)</h4>
        <p>Now, it's time for the mycelium to take over the substrate.</p>
        <ol>
          <li><strong>Pack and Seal:</strong> Pack the mixture into your grow bags and seal them. If using a bucket, pack it and cover the top.</li>
          <li><strong>Wait in the Dark:</strong> Place the bags in a dark, warm place (around 20-24°C). A closet works perfectly.</li>
          <li><strong>Watch the Growth:</strong> Over the next 2-3 weeks, you'll see the white, web-like mycelium spreading. The bag is ready for the next step when it's almost completely white.</li>
        </ol>
        
        <h4>Step 4: Fruiting (Growing the Mushrooms!)</h4>
        <ol>
          <li><strong>Introduce Fruiting Conditions:</strong> Move the fully colonized bag to a spot with indirect sunlight and good fresh air.</li>
          <li><strong>Cut the Bag:</strong> Cut one or two "X" shaped slits in the bag. This is where your mushrooms will emerge.</li>
          <li><strong>Mist Daily:</strong> Humidity is crucial. Mist the area around the slits 2-3 times a day to keep the air moist.</li>
          <li><strong>Harvest:</strong> In about a week, you'll see tiny mushroom "pins" form. They grow incredibly fast and are ready to harvest when the caps start to flatten. Gently twist and pull the entire cluster from the base.</li>
        </ol>
        
        <h3>Conclusion</h3>
        <p>Growing your own oyster mushrooms is more than just a fun project; it's a rewarding way to connect with your food, add incredible flavour and nutrition to your meals, and experience the magic of fungi firsthand. As you've seen, the process is straightforward, the costs are minimal, and the health benefits are immense.</p>
        <p>So, why not give it a try and bring a little bit of the forest to your kitchen? Happy growing!</p>
      `,
    },
    create: {
      title: 'From Spore to Plate: The Ultimate Guide to Growing Oyster Mushrooms at Home',
      slug: 'growing-oyster-mushrooms-guide',
      excerpt: 'Have you ever walked through a farmers\' market and admired the beautiful clusters of fresh, gourmet mushrooms, wishing you could have that kind of quality right in your own kitchen? Well, you can! Meet the oyster mushroom—a delicious, versatile, and incredibly nutritious fungus that is surprisingly easy to grow at home.',
      content: `
        <p>Have you ever walked through a farmers' market and admired the beautiful clusters of fresh, gourmet mushrooms, wishing you could have that kind of quality right in your own kitchen? Well, you can! Meet the oyster mushroom—a delicious, versatile, and incredibly nutritious fungus that is surprisingly easy to grow at home.</p>
        
        <p>Whether you're a seasoned gardener or a complete beginner, this guide will walk you through everything you need to know, from the amazing health benefits to the simple steps for cultivating your very own mushroom harvest in a controlled environment.</p>
        
        <h3>Why Grow Oyster Mushrooms? The Health Advantages</h3>
        <ul>
          <li><strong>A Nutrient Powerhouse:</strong> Oyster mushrooms are packed with essential nutrients while being low in calories. They are an excellent source of plant-based protein, fiber, B vitamins (like niacin and riboflavin), and important minerals like potassium.</li>
          <li><strong>Immune System Support:</strong> They contain special compounds called beta-glucans, which are known to help modulate and strengthen the immune system, keeping your body's defenses strong.</li>
          <li><strong>Heart Health Hero:</strong> Studies have shown that oyster mushrooms can help maintain healthy cholesterol levels, making them a heart-friendly addition to any diet.</li>
          <li><strong>Rich in Antioxidants:</strong> They are a great source of antioxidants, such as ergothioneine, which help protect your body's cells from damage and oxidative stress.</li>
        </ul>
        
        <h3>How to Grow at Home (Without a Kit)</h3>
        <p>Growing oyster mushrooms without a pre-made kit is a deeply rewarding project. The method we'll use involves pasteurizing a substrate with boiling water to eliminate most contaminants, giving your mushroom mycelium a clean slate to thrive.</p>
        
        <h4>Materials You'll Need:</h4>
        <ul>
          <li><strong>Oyster Mushroom Spawn:</strong> This is live mushroom mycelium, usually on a grain or sawdust carrier. You can buy this online.</li>
          <li><strong>Substrate:</strong> Chopped straw or hardwood sawdust are excellent choices for beginners.</li>
          <li><strong>Large Pot:</strong> For boiling and pasteurizing your substrate.</li>
          <li><strong>Strainer or Mesh Bag:</strong> A clean pillowcase also works well for draining.</li>
          <li><strong>Grow Bags:</strong> Special mushroom grow bags with filter patches are ideal, but clean plastic buckets with drilled holes can also be used.</li>
          <li><strong>Isopropyl Alcohol (70%):</strong> For sanitizing surfaces and your hands.</li>
        </ul>
        
        <h4>What's the Cost? A Quick Breakdown</h4>
        <p>One of the best parts of this DIY method is its affordability. Here's a rough estimate of the initial costs (prices in Dehradun may vary):</p>
        <ul>
          <li><strong>Oyster Mushroom Spawn:</strong> A 1kg bag of quality spawn will cost around ₹200 - ₹300 and is enough for several grow bags.</li>
          <li><strong>Substrate (Straw):</strong> This is very cheap. A large bundle of straw from a local supplier might cost ₹50 - ₹100.</li>
          <li><strong>Grow Bags:</strong> These are also inexpensive, typically costing ₹10 - ₹20 per bag.</li>
        </ul>
        <p>Your initial investment could be as low as <strong>₹400 - ₹500</strong>, which will yield several kilograms of fresh, organic mushrooms over multiple harvests—far cheaper than buying them at the market!</p>
        
        <h4>Step 1: Prepare and Pasteurize the Substrate</h4>
        <ol>
          <li><strong>Chop the Substrate:</strong> If using straw, cut it into 1-3 inch pieces. This increases the surface area for the mycelium to colonize.</li>
          <li><strong>Boil and Simmer:</strong> Place your substrate in the large pot, cover it with water, and bring to a boil. Let it simmer for 60-90 minutes to pasteurize it.</li>
          <li><strong>Drain and Cool:</strong> Carefully drain all the hot water. Spread the substrate on a clean, sanitized surface to cool down to room temperature. This can take a few hours.</li>
          <li><strong>Check Moisture (The Squeeze Test):</strong> Once cool, grab a handful and squeeze firmly. Only a few drops of water should come out. If it streams water, it's too wet. If nothing comes out, it's too dry and needs a light misting.</li>
        </ol>
        
        <h4>Step 2: Inoculation (Mixing Spawn and Substrate)</h4>
        <p>This is where you introduce the mycelium to its food source. Cleanliness is critical here!</p>
        <ol>
          <li><strong>Sanitize Everything:</strong> Wipe down your work surface, grow bags, and wash your hands thoroughly with 70% isopropyl alcohol.</li>
          <li><strong>Mix Thoroughly:</strong> In a clean tub or directly in your grow bag, layer and mix your cooled substrate with the spawn. A good ratio is about 5-10% spawn to substrate by weight. Ensure it's evenly distributed.</li>
        </ol>
        
        <h4>Step 3: Incubation (Colonization)</h4>
        <p>Now, it's time for the mycelium to take over the substrate.</p>
        <ol>
          <li><strong>Pack and Seal:</strong> Pack the mixture into your grow bags and seal them. If using a bucket, pack it and cover the top.</li>
          <li><strong>Wait in the Dark:</strong> Place the bags in a dark, warm place (around 20-24°C). A closet works perfectly.</li>
          <li><strong>Watch the Growth:</strong> Over the next 2-3 weeks, you'll see the white, web-like mycelium spreading. The bag is ready for the next step when it's almost completely white.</li>
        </ol>
        
        <h4>Step 4: Fruiting (Growing the Mushrooms!)</h4>
        <ol>
          <li><strong>Introduce Fruiting Conditions:</strong> Move the fully colonized bag to a spot with indirect sunlight and good fresh air.</li>
          <li><strong>Cut the Bag:</strong> Cut one or two "X" shaped slits in the bag. This is where your mushrooms will emerge.</li>
          <li><strong>Mist Daily:</strong> Humidity is crucial. Mist the area around the slits 2-3 times a day to keep the air moist.</li>
          <li><strong>Harvest:</strong> In about a week, you'll see tiny mushroom "pins" form. They grow incredibly fast and are ready to harvest when the caps start to flatten. Gently twist and pull the entire cluster from the base.</li>
        </ol>
        
        <h3>Conclusion</h3>
        <p>Growing your own oyster mushrooms is more than just a fun project; it's a rewarding way to connect with your food, add incredible flavour and nutrition to your meals, and experience the magic of fungi firsthand. As you've seen, the process is straightforward, the costs are minimal, and the health benefits are immense.</p>
        <p>So, why not give it a try and bring a little bit of the forest to your kitchen? Happy growing!</p>
      `,
      img: '/images/blog/oyster-blog-01.png',
      published: true,
      views: 0,
    },
  })

  console.log('✅ Blog post seeded successfully!')
  console.log('Title:', blogPost.title)
  console.log('Slug:', blogPost.slug)
  console.log('Views:', blogPost.views)
  console.log('Published:', blogPost.published)
  
  if (existingPost) {
    console.log('✅ View counter reset from', existingPost.views, 'to', blogPost.views)
  } else {
    console.log('✅ New blog post created with 0 views')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding blog post:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
