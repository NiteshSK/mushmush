import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'all-mushrooms' },
      update: {},
      create: {
        title: 'All Mushrooms',
        slug: 'all-mushrooms',
        img: '/images/categories/mushrooms.png',
        path: '/shop-without-sidebar',
        description: 'Complete collection of all mushroom varieties'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'edible' },
      update: {},
      create: {
        title: 'Edible',
        slug: 'edible',
        img: '/images/categories/edible_mushrooms.png',
        path: '/shop-without-sidebar?category=edible',
        description: 'Fresh edible mushrooms for culinary use'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'medicinal' },
      update: {},
      create: {
        title: 'Medicinal',
        slug: 'medicinal',
        img: '/images/categories/medicinal_mushrooms.png',
        path: '/shop-without-sidebar?category=medicinal',
        description: 'Medicinal mushrooms for health and wellness'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'tinctures' },
      update: {},
      create: {
        title: 'Tinctures',
        slug: 'tinctures',
        img: '/images/categories/generic_tincture.png',
        path: '/shop-without-sidebar?category=tinctures',
        description: 'Concentrated mushroom tinctures and extracts'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'powders' },
      update: {},
      create: {
        title: 'Dry Powder',
        slug: 'powders',
        img: '/images/categories/powders.png',
        path: '/shop-without-sidebar?category=powders',
        description: 'Dried mushroom powders and supplements'
      }
    })
  ])

  console.log('✅ Categories created')

  // Create products with their relationships
  const products = [
    {
      title: "Ganoderma lucidum",
      slug: "ganoderma-lucidum",
      description: "Our <strong>Ganoderma lucidum</strong>, commonly known as Reishi or Lingzhi, is cultivated and processed under the strictest quality standards to deliver a product of exceptional purity and potency. Revered for centuries in traditional medicine as the \"Mushroom of Immortality,\" our Reishi extract is designed to support modern wellness goals.",
      price: 999,
      discountedPrice: 899,
      measurementValue: 100,
      measurementType: "gm",
      inStock: false,
      featured: true,
      imgs: {
        thumbnails: [
          "/images/products/ganoderma_sticker.png",
          "/images/products/ganoderma_package.png",
          "/images/products/ganoderma_specs.png",
          "/images/products/ganoderma.png",
        ],
        previews: [
          "/images/products/ganoderma_sticker.png",
          "/images/products/ganoderma_package.png",
          "/images/products/ganoderma_specs.png",
          "/images/products/ganoderma.png",
        ]
      },
      specifications: [
        "<strong>Extraction Method:</strong> Advanced Dual-Extraction (temperature-controlled hot water and alcohol) to ensure the bioavailability of both water-soluble and alcohol-soluble compounds like triterpenes.",
        "<strong>Extraction Ratio:</strong> A potent 10:1 extract ratio, meaning 10kg of raw mushroom is used to produce 1kg of extract powder.",
        "<strong>Drying Method:</strong> Spray-dried to preserve the integrity and potency of the active compounds.",
        "<strong>Polysaccharides:</strong> ≥ 30%",
        "<strong>Beta-Glucans:</strong> ≥ 20%",
        "<strong>Triterpenes:</strong> ≥ 4%"
      ],
      howToConsume: [
        "<strong>As a Simple Tea</strong>: Mix about half a teaspoon of Ganoderma powder in a cup of hot water. Add honey, jaggery, or a squeeze of lemon to balance the natural bitterness.",
        "<strong>Stir into Coffee or Chai</strong>: Add a serving of the powder directly to your daily coffee or masala chai. The strong flavours of these beverages effectively mask the mushroom's taste.",
        "<strong>Blend into Smoothies</strong>: Add the powder to your fruit or vegetable smoothies. The other ingredients will completely hide the taste while you still get all the benefits.",
        "<strong>Add to Soups and Food</strong>: Stir the powder into warm soups, dals, or broths. Its earthy, umami flavour can enhance the taste of savoury dishes.",
        "<strong>Take as Capsules</strong>: For the most convenient and taste-free option, take Ganoderma in capsule form and swallow with water as per the dosage instructions.",
        "<strong>Brew from Dried Slices</strong>: If you have whole dried Reishi, simmer a few pieces in water for at least one hour to create a traditional, potent health tonic."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Organic Reishi Mushroom Powder (or Extract)" },
        { label: "Botanical Name", value: "Ganoderma lucidum" },
        { label: "Common Names", value: "Reishi, Lingzhi" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Fine, reddish-brown powder" },
        { label: "Taste", value: "Characteristically bitter" },
        { label: "Odor", value: "Mild, earthy aroma" }
      ],
      categories: ['medicinal', 'powders']
    },
    {
      title: "Oyster Mushroom",
      slug: "oyster-mushroom",
      description: "<strong>Oyster mushrooms</strong>, scientifically known as <strong>Pleurotus</strong>, are a popular and versatile variety of edible fungi cherished for their delicate flavor and velvety texture. Their name is derived from their characteristic shell-like appearance, with a cap that resembles an oyster. Found in temperate and tropical forests worldwide, they typically grow in shelf-like clusters on dead or dying deciduous trees",
      price: 169,
      discountedPrice: 149,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: [
          "/images/products/oyster_sticker.png",
          "/images/products/oyster_package.png",
          "/images/products/oyster.png",
        ],
        previews: [
          "/images/products/oyster_sticker.png",
          "/images/products/oyster_package.png",
          "/images/products/oyster.png",
        ]
      },
      specifications: [
        "<strong>Appearance</strong>: Oyster mushrooms have a distinctive fan- or oyster-shaped cap that can range in color from pale grey and white to tan, and even pink or yellow, depending on the species. The cap is typically 5 to 25 centimeters in diameter. Their gills are white to cream-colored and run down a short, often stubby, and sometimes nonexistent stem. The flesh is firm, thick, and white.",
        "<strong>Species</strong>: There are several species of oyster mushrooms, with the most common being Pleurotus ostreatus (the pearl oyster mushroom). Other popular varieties include the king oyster mushroom (Pleurotus eryngii), which is prized for its thick, meaty stem, the golden oyster mushroom (Pleurotus citrinopileatus), and the pink oyster mushroom (Pleurotus djamor).",
        "<strong>Flavor and Aroma</strong>: Oyster mushrooms have a mild and subtle flavor with hints of earthiness and a slight sweetness. Some describe the aroma as faintly reminiscent of anise. Their delicate taste allows them to absorb the flavors of the dishes they are cooked in.",
        "<strong>Nutritional Value</strong>: These mushrooms are a good source of protein, fiber, B vitamins (especially niacin and riboflavin), potassium, and antioxidants. They are low in calories and fat."
      ],
      howToConsume: [
        "<strong>Sautéing</strong>: This is one of the most popular and quickest ways to cook oyster mushrooms. Heat a pan with a little oil or butter over medium-high heat. Add the mushrooms in a single layer and cook for 5-7 minutes, stirring occasionally, until they are golden brown and slightly crispy. Season with salt, pepper, garlic, and herbs for enhanced flavor.",
        "<strong>Roasting</strong>: Roasting oyster mushrooms in the oven brings out their natural sweetness and gives them a meatier texture. Toss the mushrooms with olive oil, salt, and your favorite seasonings. Spread them in a single layer on a baking sheet and roast at 200°C (400°F) for 15-20 minutes, or until they are browned and crispy.",
        "<strong>Grilling</strong>: Grilling imparts a smoky flavor to oyster mushrooms. Thread them onto skewers, brush with a marinade of your choice, and grill over medium heat for 5-7 minutes on each side, until they are tender and have grill marks.",
        "<strong>Simmering in Soups and Stews</strong>: Oyster mushrooms are a great addition to soups, stews, and broths. Their ability to absorb flavors makes them a delicious and textural component. Add them to your pot during the last 15-20 minutes of cooking.",
        "<strong>Stir-frying</strong>: Their quick cooking time makes oyster mushrooms ideal for stir-fries. Add them to your wok with other vegetables and your favorite stir-fry sauce for a delicious and healthy meal.",
        "<strong>Breading and Frying</strong>: For a crispy and indulgent treat, oyster mushrooms can be breaded and deep-fried or air-fried. This method gives them a texture similar to fried chicken or calamari."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Organic Oyster Mushroom Powder (or Fresh/Dried)" },
        { label: "Botanical Name", value: "Pleurotus ostreatus" },
        { label: "Common Names", value: "Oyster Mushroom, Pearl Oyster Mushroom, Dhingri (in India)" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Fresh: Fan-shaped, white to greyish-brown. Powder: Light beige to tan." },
        { label: "Taste", value: "Mild, savory, subtly sweet with a velvety texture" },
        { label: "Odor", value: "Delicate, earthy aroma, sometimes with a faint hint of anise" }
      ],
      categories: ['edible']
    }
    // Add more products as needed...
  ]

  for (const productData of products) {
    const { categories: categoryNames, ...productInfo } = productData
    
    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {},
      create: productInfo
    })

    // Connect categories
    for (const categoryName of categoryNames) {
      const category = categories.find(c => c.slug === categoryName)
      if (category) {
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: {
              productId: product.id,
              categoryId: category.id
            }
          },
          update: {},
          create: {
            productId: product.id,
            categoryId: category.id
          }
        })
      }
    }
  }

  console.log('✅ Products created')

  // Create sample blog post
  await prisma.blogPost.upsert({
    where: { slug: 'growing-oyster-mushrooms-guide' },
    update: {},
    create: {
      title: 'From Spore to Plate: The Ultimate Guide to Growing Oyster Mushrooms at Home',
      slug: 'growing-oyster-mushrooms-guide',
      content: 'Complete guide content here...',
      excerpt: 'Learn how to grow delicious oyster mushrooms at home with this comprehensive guide.',
      img: '/images/blog/oyster-blog-01.png',
      views: 100000,
      published: true,
      metaTitle: 'How to Grow Oyster Mushrooms at Home - Complete Guide',
      metaDescription: 'Step-by-step guide to growing oyster mushrooms at home. Learn about spawn, growing conditions, and harvesting techniques.'
    }
  })

  console.log('✅ Blog posts created')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
