import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'edible' },
      update: {
        title: 'Edible',
        img: '/images/categories/edible_mushrooms.png',
        path: '/shop?category=edible',
        description: 'Fresh edible mushrooms for culinary use'
      },
      create: {
        title: 'Edible',
        slug: 'edible',
        img: '/images/categories/edible_mushrooms.png',
        path: '/shop?category=edible',
        description: 'Fresh edible mushrooms for culinary use'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'medicinal' },
      update: {
        title: 'Medicinal',
        img: '/images/categories/medicinal_mushrooms.png',
        path: '/shop?category=medicinal',
        description: 'Medicinal mushrooms for health and wellness'
      },
      create: {
        title: 'Medicinal',
        slug: 'medicinal',
        img: '/images/categories/medicinal_mushrooms.png',
        path: '/shop?category=medicinal',
        description: 'Medicinal mushrooms for health and wellness'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'tinctures' },
      update: {
        title: 'Tinctures',
        img: '/images/categories/generic_tincture.png',
        path: '/shop?category=tinctures',
        description: 'Concentrated mushroom tinctures and extracts'
      },
      create: {
        title: 'Tinctures',
        slug: 'tinctures',
        img: '/images/categories/generic_tincture.png',
        path: '/shop?category=tinctures',
        description: 'Concentrated mushroom tinctures and extracts'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'powders' },
      update: {
        title: 'Dry Powder',
        img: '/images/categories/powders.png',
        path: '/shop?category=powders',
        description: 'Dried mushroom powders and supplements'
      },
      create: {
        title: 'Dry Powder',
        slug: 'powders',
        img: '/images/categories/powders.png',
        path: '/shop?category=powders',
        description: 'Dried mushroom powders and supplements'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'dry-fruits' },
      update: {
        title: 'Dry Fruits',
        img: '/images/categories/nuts.png',
        path: '/shop?category=dry-fruits',
        description: 'Premium dry fruits and nuts sourced from the finest orchards'
      },
      create: {
        title: 'Dry Fruits',
        slug: 'dry-fruits',
        img: '/images/categories/nuts.png',
        path: '/shop?category=dry-fruits',
        description: 'Premium dry fruits and nuts sourced from the finest orchards'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'seeds' },
      update: {
        title: 'Seeds',
        img: '/images/categories/seeds.png',
        path: '/shop?category=seeds',
        description: 'Premium seeds for health and nutrition'
      },
      create: {
        title: 'Seeds',
        slug: 'seeds',
        img: '/images/categories/seeds.png',
        path: '/shop?category=seeds',
        description: 'Premium seeds for health and nutrition'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'spices' },
      update: {
        title: 'Spices',
        img: '/images/categories/spices.jpg',
        path: '/shop?category=spices',
        description: 'Authentic Himalayan and premium spices for your kitchen'
      },
      create: {
        title: 'Spices',
        slug: 'spices',
        img: '/images/categories/spices.jpg',
        path: '/shop?category=spices',
        description: 'Authentic Himalayan and premium spices for your kitchen'
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
          "/images/products/ganoderma_real_1.png",
          "/images/products/ganoderma_real_2.png",
        ],
        previews: [
          "/images/products/ganoderma_sticker.png",
          "/images/products/ganoderma_package.png",
          "/images/products/ganoderma_specs.png",
          "/images/products/ganoderma.png",
          "/images/products/ganoderma_real_1.png",
          "/images/products/ganoderma_real_2.png",
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
    },
    {
      title: "Chantrelle",
      slug: "chantrelle",
      description: "Chanterelle <i>(Cantharellus cibarius)</i> is a celebrated wild mushroom, famous for its beautiful golden color, delicate texture, and a subtle, fruity aroma reminiscent of apricots. Unlike cultivated mushrooms, chanterelles are foraged from forests, growing in symbiotic relationships with trees. They are a true gourmet delicacy, sought after by chefs and food lovers around the world.",
      price: 699,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: [
          "/images/products/chantrelle_sticker.png",
          "/images/products/chantrelle_package.png",
          "/images/products/chantrelle.png",
        ],
        previews: [
          "/images/products/chantrelle_sticker.png",
          "/images/products/chantrelle_package.png",
          "/images/products/chantrelle.png",
        ]
      },
      specifications: [
        "<strong>Appearance</strong>: Chanterelles are typically trumpet or funnel-shaped, with a wavy, irregular cap. Their color ranges from a vibrant yellow to a deep golden-orange. Instead of true gills, they have distinctive blunt, forked ridges that run down the stem.",
        "<strong>Flavor and Aroma</strong>: They have a unique and complex flavor that is both peppery and fruity, with distinct notes of apricot or peach. The texture is wonderfully chewy and firm, yet tender when cooked.",
        "<strong>Nutritional Value</strong>: Chanterelles are a great source of vitamins D and B, particularly niacin and riboflavin. They also provide essential minerals like iron and potassium, and are rich in polysaccharides, which are known for their immune-supporting properties."
      ],
      howToConsume: [
        "<strong>Simple Sauté</strong>: This is the best way to enjoy their unique flavor. Sauté them in butter or olive oil with a little garlic and fresh thyme or parsley. Their flavor is delicate, so they don't need much.",
        "<strong>Creamy Sauces</strong>: Chanterelles are famously used in creamy pasta sauces or served over steak or chicken. Their firm texture holds up beautifully in rich sauces.",
        "<strong>Soups and Risottos</strong>: Add them to risottos or creamy soups to impart a luxurious, earthy, and fruity flavor.",
        "<strong>Preserving</strong>: Chanterelles don't rehydrate well from a fully dried state. The best way to preserve them is to sauté them first and then freeze them in an airtight container."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Wild Foraged Chanterelle Mushrooms (Fresh)" },
        { label: "Botanical Name", value: "Cantharellus cibarius" },
        { label: "Common Names", value: "Chanterelle, Golden Chanterelle, Girolle" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Fresh: Golden-orange, trumpet-shaped with forked ridges." },
        { label: "Taste", value: "Delicate, peppery, and fruity with notes of apricot" },
        { label: "Odor", value: "Distinctive fruity aroma, often compared to apricots" }
      ],
      categories: ['edible']
    },
    {
      title: "Shitake",
      slug: "shitake",
      description: "Shiitake <i>(Lentinula edodes)</i> is one of the most popular and cultivated mushrooms worldwide, prized for its rich, savory taste and significant health benefits. Native to East Asia, it grows on decaying hardwood trees and has been a staple in Asian cuisine and traditional medicine for centuries. Its deep, umami flavor makes it a culinary cornerstone in many dishes.",
      price: 499,
      measurementValue: 100,
      measurementType: "gm",
      inStock: false,
      featured: false,
      imgs: {
        thumbnails: [
          "/images/products/shitake_sticker.png",
          "/images/products/shitake_package.png",
          "/images/products/shitake_package_2.png",
          "/images/products/shitake_on_log.png",
          "/images/products/shitake.png",
        ],
        previews: [
          "/images/products/shitake_sticker.png",
          "/images/products/shitake_package.png",
          "/images/products/shitake_package_2.png",
          "/images/products/shitake_on_log.png",
          "/images/products/shitake.png",
        ]
      },
      specifications: [
        "<strong>Appearance</strong>: Shiitake mushrooms have a distinct umbrella-shaped cap, typically ranging from 5 to 10 centimeters in diameter. The cap is light to dark brown, often with a slightly cracked or scaly texture on the surface. The gills underneath are white to light brown, and the stem is tough, fibrous, and usually removed before cooking.",
        "<strong>Flavor and Aroma</strong>: Shiitakes are renowned for their potent umami (savory) flavor, which is rich, smoky, and earthy. The aroma is equally robust and distinctive. When cooked, they develop a dense, meaty texture that is satisfyingly chewy.",
        "<strong>Nutritional Value</strong>: These mushrooms are an excellent source of B vitamins (especially pantothenic acid and B6), copper, selenium, manganese, and zinc. They are also rich in polysaccharides like lentinan and other unique bioactive compounds, which are studied for their immune-boosting and cholesterol-lowering properties."
      ],
      howToConsume: [
        "<strong>Sautéing and Stir-frying</strong>: This is a classic method that intensifies their flavor. Slice the caps and sauté in oil or butter with garlic and soy sauce. Their robust texture holds up well in stir-fries with other vegetables and proteins.",
        "<strong>Roasting</strong>: Roasting shiitakes brings out a deeper, more concentrated savory flavor. Toss whole or halved caps with oil and seasonings and roast at 200°C (400°F) for 15-20 minutes until the edges are caramelized and crispy.",
        "<strong>Soups and Broths</strong>: Shiitakes are essential for adding a deep, savory foundation to soups and broths, like Japanese miso soup or dashi stock. Both fresh and rehydrated dried mushrooms can be used.",
        "<strong>Grilling</strong>: Thread whole shiitake caps onto skewers, marinate them in a savory glaze (like teriyaki), and grill until tender and slightly charred. The tough stems can be used to flavor stocks and broths.",
        "<strong>Using Dried Shiitakes</strong>: Dried shiitakes have a more intense flavor than fresh ones. To use, rehydrate them in warm water for 20-30 minutes until soft. The flavorful soaking liquid can be strained and used as a broth in your recipe.",
        "<i>Medicinal Consumption: For centuries, shiitake has been used in traditional medicine for its health-promoting properties. Today, it is available in concentrated forms for therapeutic use:</i>",
        "<strong>Supplements</strong>: Shiitake extract is available in capsules, powders, and tinctures, primarily used to support immune function and cardiovascular health."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Organic Shiitake Mushroom Powder (or Fresh/Dried)" },
        { label: "Botanical Name", value: "Lentinula edodes" },
        { label: "Common Names", value: "Shiitake, Forest Mushroom, Oak Mushroom" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Fresh: Brown, umbrella-shaped cap with a fibrous stem. Powder: Light to medium brown." },
        { label: "Taste", value: "Rich, umami, smoky, and earthy with a meaty texture" },
        { label: "Odor", value: "Distinctive, savory, and earthy aroma" }
      ],
      categories: ['edible', 'medicinal']
    },
    {
      title: "Lion's Mane",
      slug: "lion-s-mane",
      description: "Lion's Mane (Hericium erinaceus), also known as the \"pom-pom mushroom,\" is a unique and increasingly popular edible and medicinal fungus. Its striking appearance and remarkable health benefits have garnered significant attention in both culinary and wellness circles. Native to North America, Europe, and Asia, this mushroom typically grows on dead or dying hardwood trees, particularly oak and beech.",
      price: 1599,
      measurementValue: 100,
      measurementType: "gm",
      inStock: false,
      featured: false,
      imgs: {
        thumbnails: [
          "/images/products/lions_mane.png",
        ],
        previews: [
          "/images/products/lions_mane.png",
        ]
      },
      specifications: [
        "<strong>Appearance</strong>: Lion's Mane is easily identifiable by its shaggy, icicle-like spines that cascade downwards, resembling a lion's mane or a frozen waterfall. Unlike traditional mushrooms with caps and gills, it has a single, clump-like structure that is white to off-white in color. As it matures, the tips of the spines may turn a slightly brownish hue. The texture is soft, spongy, and somewhat stringy, often compared to seafood like crab or lobster.",
        "<strong>Flavor and Aroma</strong>: When cooked, Lion's Mane has a mild, savory flavor that is often described as seafood-like, with a subtle sweetness. Its aroma is delicate and earthy. The texture is tender and chewy, which makes it a popular meat substitute in vegetarian and vegan dishes.",
        "<strong>Nutritional Value</strong>: This mushroom is a good source of protein, fiber, potassium, and various antioxidants. It is low in calories and fat. What truly sets Lion's Mane apart are its unique bioactive compounds, including hericenones and erinacines, which are believed to be responsible for its cognitive-enhancing properties."
      ],
      howToConsume: [
        "<strong>Sautéing</strong>: This is one of the most popular and straightforward ways to prepare Lion's Mane. Heat a pan with a bit of butter or oil over medium heat. Add the sliced or torn mushroom and cook for about 5-7 minutes on each side, until it's golden brown and slightly crispy. Season with salt, pepper, garlic, and fresh herbs like thyme or parsley.",
        "<strong>Roasting</strong>: Roasting enhances the mushroom's natural sweetness and gives it a meatier texture. Toss the mushroom pieces with olive oil and your favorite seasonings. Spread them on a baking sheet and roast at 200°C (400°F) for 15-20 minutes, or until the edges are crispy.",
        "<strong>Crab Cakes</strong>: Due to its crab-like texture, Lion's Mane is an excellent ingredient for vegan or vegetarian \"crab\" cakes. Shred the mushroom, mix it with breadcrumbs, mayonnaise (or a vegan alternative), and seasonings, then form into patties and pan-fry until golden.",
        "<strong>Soups and Stews</strong>: Add chunks of Lion's Mane to soups and stews to impart a savory depth of flavor and a satisfying, meaty texture. It absorbs the surrounding flavors well.",
        "<strong>Sandwiches and Tacos</strong>: Sautéed or roasted Lion's Mane makes a delicious and hearty filling for sandwiches, tacos, and wraps. It's often used as a substitute for pulled pork or shredded chicken.",
        "<i>Medicinal Consumption: Beyond its culinary uses, Lion's Mane is widely consumed for its potential health benefits, particularly for cognitive function. For this purpose, it is available in various forms:</i>",
        "<strong>Supplements</strong>: Capsules, powders, and tinctures are popular ways to consume Lion's Mane for its medicinal properties. These can be found at health food stores and online.",
        "<strong>Mushroom Coffee and Tea</strong>: Lion's Mane powder is often added to coffee, tea, and other beverages for a daily cognitive boost."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Organic Lion's Mane Mushroom Powder (or Fresh/Dried)" },
        { label: "Botanical Name", value: "Hericium erinaceus" },
        { label: "Common Names", value: "Lion's Mane, Pom Pom Mushroom, Yamabushitake" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Fresh: White, cascading, icicle-like spines. Powder: Creamy white to light beige." },
        { label: "Taste", value: "Savory and mild, with a texture and flavor reminiscent of crab or lobster" },
        { label: "Odor", value: "Subtle, earthy, and slightly sweet" }
      ],
      categories: ['edible', 'medicinal']
    },
    {
      title: "Ganoderma's Tincture",
      slug: "ganoderma-s-tincture",
      description: "Ganoderma Tincture, derived from the revered <i>Ganoderma lucidum</i> mushroom, is a potent liquid extract designed for modern wellness. Known for centuries in traditional medicine as 'Reishi' or the 'Mushroom of Immortality,' this tincture concentrates the mushroom's powerful adaptogenic properties. It's crafted to support stress management, enhance immune function, and promote overall vitality, making it a cornerstone for any natural health regimen.",
      price: 1699,
      measurementValue: 10,
      measurementType: "ml",
      inStock: false,
      featured: false,
      imgs: {
        thumbnails: [
          "/images/products/ganoderma_tincture_sticker.png",
        ],
        previews: [
          "/images/products/ganoderma_tincture_sticker.png",
        ]
      },
      specifications: [
        "<strong>Appearance</strong>: The tincture is a rich, dark-brown liquid. It is derived from the Ganoderma mushroom, which is known for its glossy, reddish-brown, kidney-shaped cap and woody texture.",
        "<strong>Flavor and Aroma</strong>: Ganoderma is famous for its distinctly bitter and woody taste, a sign of its potent compounds. The aroma is deep and earthy, reflecting its natural forest origins.",
        "<strong>Active Compounds</strong>: This tincture is a concentrated source of Ganoderma's key bioactive compounds, primarily triterpenoids and polysaccharides (like beta-glucans). These are studied for their significant roles in supporting the immune system and helping the body adapt to stress."
      ],
      howToConsume: [
        "<strong>Sublingual (Under the Tongue)</strong>: For fastest absorption, place a full dropper (approximately 1ml) directly under your tongue and hold it for 60-90 seconds before swallowing.",
        "<strong>Add to Beverages</strong>: Easily mix a dropperful into your morning coffee, tea, smoothie, or even a glass of water. The potent flavor is often best diluted in a drink.",
        "<strong>Consistent Daily Use</strong>: For best results, take 1-2 droppers daily. As an adaptogen, Ganoderma's benefits are most pronounced with consistent, long-term use.",
        "<strong>Evening Routine</strong>: Many users prefer taking Ganoderma tincture in the evening to help promote relaxation and support a restful night's sleep."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Organic Ganoderma Tincture (Reishi Extract)" },
        { label: "Botanical Name", value: "Ganoderma lucidum" },
        { label: "Common Names", value: "Reishi, Lingzhi, Mushroom of Immortality" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Dark, rich brown liquid extract" },
      ],
      categories: ['tinctures', 'medicinal']
    },

    // ── Dry Fruits ──
    {
      title: "Premium Almonds",
      slug: "premium-almonds",
      description: "<strong>Premium Almonds</strong> (Badam) are among the most nutritious and versatile nuts available. Our almonds are carefully sourced from the finest orchards, ensuring a rich, buttery flavor and satisfying crunch. Packed with healthy fats, protein, fiber, and essential vitamins, they are a powerhouse snack that supports heart health, brain function, and overall wellness.",
      price: 399,
      measurementValue: 250,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: ["/images/products/almonds.png"],
        previews: ["/images/products/almonds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> California / Mamra Almonds, whole and unbroken",
        "<strong>Appearance:</strong> Uniform, light brown skin with a creamy white interior",
        "<strong>Nutritional Value:</strong> Rich in Vitamin E, magnesium, healthy monounsaturated fats, protein, and dietary fiber. Excellent source of antioxidants.",
        "<strong>Shelf Life:</strong> 6-8 months when stored in a cool, dry place in an airtight container"
      ],
      howToConsume: [
        "<strong>Raw Snacking:</strong> Enjoy a handful of almonds as a quick, nutrient-dense snack between meals.",
        "<strong>Soaked Almonds:</strong> Soak 8-10 almonds overnight in water. Peel and eat first thing in the morning for enhanced nutrient absorption and brain health.",
        "<strong>Almond Milk:</strong> Blend soaked almonds with water and strain for a creamy, dairy-free milk alternative.",
        "<strong>In Cooking & Baking:</strong> Add chopped or slivered almonds to salads, desserts, smoothies, oatmeal, or use as a crunchy topping for curries and biryanis.",
        "<strong>Almond Butter:</strong> Roast and blend into a smooth, homemade almond butter — a healthy spread for toast and fruits."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Whole Almonds (Badam)" },
        { label: "Botanical Name", value: "Prunus dulcis" },
        { label: "Common Names", value: "Almond, Badam" },
        { label: "Origin", value: "California / Kashmir" },
        { label: "Appearance", value: "Whole, light brown skinned nuts with creamy white flesh" },
        { label: "Taste", value: "Mildly sweet, buttery, and nutty" },
        { label: "Storage", value: "Store in a cool, dry place in an airtight container" }
      ],
      categories: ['dry-fruits']
    },
    {
      title: "Dried Apricots",
      slug: "dried-apricots",
      description: "<strong>Dried Apricots</strong> (Khubani) are sun-dried golden fruits known for their naturally sweet and tangy flavor. Our premium dried apricots are carefully selected and naturally dried to preserve their vibrant color and rich nutritional profile. They are an excellent source of iron, potassium, and Vitamin A, making them a delicious way to support eye health, digestion, and energy levels.",
      price: 349,
      measurementValue: 250,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/apricot_dry.png"],
        previews: ["/images/products/apricot_dry.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Turkish / Ladakhi Dried Apricots, naturally sun-dried",
        "<strong>Appearance:</strong> Soft, golden-orange, plump and chewy",
        "<strong>Nutritional Value:</strong> High in dietary fiber, iron, potassium, Vitamin A (beta-carotene), and antioxidants. Low in fat and cholesterol-free.",
        "<strong>Shelf Life:</strong> 8-10 months when stored in a cool, dry place"
      ],
      howToConsume: [
        "<strong>Direct Snacking:</strong> Enjoy them straight from the pack as a naturally sweet, healthy snack.",
        "<strong>Soaked:</strong> Soak overnight and consume on an empty stomach. The soaking water is also highly nutritious.",
        "<strong>In Trail Mix:</strong> Combine with almonds, walnuts, and seeds for a nutrient-packed trail mix.",
        "<strong>In Cooking:</strong> Add to oatmeal, yogurt bowls, cakes, and Middle Eastern dishes like tagines for a natural sweetness.",
        "<strong>Apricot Compote:</strong> Simmer with a little water and honey to make a delicious fruit compote for pancakes or desserts."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Dried Apricots (Khubani)" },
        { label: "Botanical Name", value: "Prunus armeniaca" },
        { label: "Common Names", value: "Dried Apricot, Khubani, Jardalu" },
        { label: "Origin", value: "Turkey / Ladakh" },
        { label: "Appearance", value: "Soft, golden-orange, plump dried fruits" },
        { label: "Taste", value: "Naturally sweet with a pleasant tangy note" },
        { label: "Storage", value: "Store in a cool, dry place away from direct sunlight" }
      ],
      categories: ['dry-fruits']
    },
    {
      title: "Premium Cashews",
      slug: "premium-cashews",
      description: "<strong>Premium Cashews</strong> (Kaju) are the king of dry fruits, loved for their creamy, buttery flavor and versatile culinary uses. Our whole cashews are hand-picked and graded to deliver the finest quality — W240 and W320 grade, ensuring large, unbroken kernels. Rich in healthy fats, copper, magnesium, and plant-based protein, they are a delicious snack and a staple in Indian sweets and cooking.",
      price: 499,
      measurementValue: 250,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: ["/images/products/cashew.png"],
        previews: ["/images/products/cashew.png"]
      },
      specifications: [
        "<strong>Grade:</strong> W240 / W320, whole and unbroken kernels",
        "<strong>Appearance:</strong> Creamy white, kidney-shaped nuts with a smooth surface",
        "<strong>Nutritional Value:</strong> Excellent source of copper, magnesium, manganese, zinc, and heart-healthy monounsaturated fats. Good source of plant-based protein.",
        "<strong>Shelf Life:</strong> 6 months when stored in a cool, dry place in an airtight container"
      ],
      howToConsume: [
        "<strong>Raw Snacking:</strong> Enjoy plain as a rich, satisfying snack.",
        "<strong>Roasted & Salted:</strong> Lightly roast in a dry pan or oven with a pinch of salt for enhanced flavor and crunch.",
        "<strong>Cashew Milk:</strong> Soak and blend with water for a rich, creamy dairy-free milk — perfect for smoothies and coffee.",
        "<strong>In Indian Cooking:</strong> Essential in kormas, biryanis, kheer, barfi, and halwa. Adds richness and creaminess to gravies when ground into a paste.",
        "<strong>Cashew Butter:</strong> Roast and blend into a smooth, naturally creamy nut butter."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Whole Cashews (Kaju)" },
        { label: "Botanical Name", value: "Anacardium occidentale" },
        { label: "Common Names", value: "Cashew, Kaju" },
        { label: "Origin", value: "Goa / Kerala, India" },
        { label: "Appearance", value: "Creamy white, kidney-shaped whole kernels" },
        { label: "Taste", value: "Buttery, mildly sweet, and creamy" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['dry-fruits']
    },
    {
      title: "Golden Raisins",
      slug: "golden-raisins",
      description: "<strong>Golden Raisins</strong> (Kishmish) are naturally dried grapes known for their sweet, juicy flavor and chewy texture. Our premium raisins are seedless, golden in color, and carefully processed to retain their natural sweetness without added sugars. They are a quick source of energy and loaded with iron, potassium, and natural sugars — making them a perfect healthy snack for all ages.",
      price: 199,
      measurementValue: 250,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/raisins.png"],
        previews: ["/images/products/raisins.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Seedless Golden Raisins (Kishmish), naturally dried",
        "<strong>Appearance:</strong> Plump, golden-yellow, soft and chewy",
        "<strong>Nutritional Value:</strong> Rich in iron, potassium, calcium, natural sugars (fructose and glucose), and dietary fiber. Good source of B vitamins and antioxidants.",
        "<strong>Shelf Life:</strong> 10-12 months when stored properly"
      ],
      howToConsume: [
        "<strong>Direct Snacking:</strong> Eat a handful as a naturally sweet energy booster.",
        "<strong>Soaked Raisins:</strong> Soak in water overnight and eat them on an empty stomach for improved digestion and iron absorption.",
        "<strong>In Cereals & Oatmeal:</strong> Sprinkle over breakfast bowls, granola, or yogurt for added sweetness.",
        "<strong>In Baking:</strong> Add to cookies, cakes, breads, and puddings for natural sweetness and texture.",
        "<strong>In Indian Cooking:</strong> Essential in pulao, biryani, kheer, and halwa. Also used in chutneys and raitas."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Golden Raisins (Kishmish)" },
        { label: "Botanical Name", value: "Vitis vinifera" },
        { label: "Common Names", value: "Raisins, Kishmish, Munakka" },
        { label: "Origin", value: "Afghanistan / India" },
        { label: "Appearance", value: "Plump, golden-yellow, seedless dried grapes" },
        { label: "Taste", value: "Naturally sweet with a soft, chewy texture" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['dry-fruits']
    },
    {
      title: "Premium Walnuts",
      slug: "premium-walnuts",
      description: "<strong>Premium Walnuts</strong> (Akhrot) are brain-shaped superfoods packed with omega-3 fatty acids, antioxidants, and essential minerals. Our walnuts are sourced from the Himalayan region of Kashmir, known for producing some of the world's finest quality kernels. With their rich, slightly bitter flavor and satisfying crunch, they support brain health, heart health, and overall wellness.",
      price: 449,
      measurementValue: 250,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/walnuts.png"],
        previews: ["/images/products/walnuts.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Kashmiri Walnut Kernels (halves and quarters)",
        "<strong>Appearance:</strong> Light brown, butterfly-shaped kernel halves with a thin papery skin",
        "<strong>Nutritional Value:</strong> Highest omega-3 content among all nuts. Rich in alpha-linolenic acid (ALA), Vitamin E, folate, melatonin, and polyphenol antioxidants.",
        "<strong>Shelf Life:</strong> 6 months when stored in a cool, dry place or refrigerated"
      ],
      howToConsume: [
        "<strong>Raw Snacking:</strong> Eat 4-5 walnut halves daily for optimal brain and heart health benefits.",
        "<strong>Soaked Walnuts:</strong> Soak overnight to reduce bitterness and improve digestibility. Peel and eat in the morning.",
        "<strong>In Smoothies:</strong> Blend into smoothies and shakes for a creamy texture and omega-3 boost.",
        "<strong>In Salads:</strong> Add chopped walnuts to salads for a satisfying crunch and nutty flavor.",
        "<strong>In Baking & Cooking:</strong> Use in brownies, banana bread, pesto, and as a topping for desserts and kheer."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Walnut Kernels (Akhrot Giri)" },
        { label: "Botanical Name", value: "Juglans regia" },
        { label: "Common Names", value: "Walnut, Akhrot" },
        { label: "Origin", value: "Kashmir, India" },
        { label: "Appearance", value: "Light brown, butterfly-shaped kernel halves" },
        { label: "Taste", value: "Rich, earthy, mildly bitter with a satisfying crunch" },
        { label: "Storage", value: "Store in an airtight container, refrigerate for longer shelf life" }
      ],
      categories: ['dry-fruits']
    },

    // ── Seeds ──
    {
      title: "Chia Seeds",
      slug: "chia-seeds",
      description: "<strong>Chia Seeds</strong> are tiny nutritional powerhouses that have earned their reputation as a modern superfood. Originally cultivated by the Aztecs and Mayans, these small black and white seeds are loaded with omega-3 fatty acids, fiber, protein, and essential minerals. Their unique ability to absorb up to 12 times their weight in water makes them incredibly versatile in the kitchen.",
      price: 249,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: ["/images/products/chia_seeds.png"],
        previews: ["/images/products/chia_seeds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Premium quality, raw, unprocessed chia seeds",
        "<strong>Appearance:</strong> Tiny, oval-shaped seeds — mix of black, grey, and white",
        "<strong>Nutritional Value:</strong> Exceptionally rich in omega-3 (ALA), soluble fiber, complete protein (all 9 essential amino acids), calcium, manganese, magnesium, and phosphorus.",
        "<strong>Shelf Life:</strong> 12-18 months when stored in a cool, dry place"
      ],
      howToConsume: [
        "<strong>Chia Pudding:</strong> Mix 2-3 tablespoons of chia seeds with milk or plant-based milk, stir well, and refrigerate overnight. Top with fruits and honey for a delicious breakfast.",
        "<strong>In Water or Juice:</strong> Add 1 tablespoon to a glass of water or lemon juice. Let it sit for 10-15 minutes to form a gel, then drink for a hydrating boost.",
        "<strong>Smoothie Booster:</strong> Add a tablespoon to any smoothie for an extra dose of omega-3 and fiber.",
        "<strong>In Baking:</strong> Use as an egg substitute (1 tbsp chia + 3 tbsp water = 1 egg). Add to breads, muffins, and energy bars.",
        "<strong>Sprinkle on Foods:</strong> Top salads, yogurt, oatmeal, or cereal with dry chia seeds for added crunch and nutrition."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Raw Chia Seeds" },
        { label: "Botanical Name", value: "Salvia hispanica" },
        { label: "Common Names", value: "Chia Seeds, Sabja Seeds (often confused)" },
        { label: "Origin", value: "Mexico / South America" },
        { label: "Appearance", value: "Tiny, oval-shaped, black and white speckled seeds" },
        { label: "Taste", value: "Mild, nutty, nearly flavourless — absorbs surrounding flavors" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['seeds']
    },
    {
      title: "Mustard Seeds",
      slug: "mustard-seeds",
      description: "<strong>Mustard Seeds</strong> (Rai/Sarson) are a fundamental spice in Indian cooking, known for their sharp, pungent kick and aromatic tempering. Our premium mustard seeds are small, round, and packed with flavor. Beyond their culinary uses, mustard seeds are rich in selenium, omega-3 fatty acids, and have been used in traditional medicine for their anti-inflammatory and digestive properties.",
      price: 79,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/mustard_seeds.png"],
        previews: ["/images/products/mustard_seeds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Black / Brown Mustard Seeds (Brassica nigra / juncea)",
        "<strong>Appearance:</strong> Tiny, round, dark brown to black seeds",
        "<strong>Nutritional Value:</strong> Good source of selenium, manganese, omega-3 fatty acids, phosphorus, and magnesium. Contains compounds like sinigrin with anti-inflammatory properties.",
        "<strong>Shelf Life:</strong> 12-18 months when stored in an airtight container"
      ],
      howToConsume: [
        "<strong>Tadka / Tempering:</strong> Heat oil, add mustard seeds and wait for them to splutter. This releases their nutty, pungent aroma — the base for dals, sambar, and South Indian dishes.",
        "<strong>In Pickles:</strong> An essential ingredient in Indian pickles (achar). The seeds add crunch and a sharp mustard flavor.",
        "<strong>Mustard Paste:</strong> Grind soaked mustard seeds into a paste for Bengali fish curries and mustard-based sauces.",
        "<strong>In Salad Dressings:</strong> Use whole or ground mustard seeds in vinaigrettes and dressings.",
        "<strong>In Marinades:</strong> Add to spice rubs and marinades for meat, fish, and vegetables."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Black Mustard Seeds (Rai)" },
        { label: "Botanical Name", value: "Brassica nigra / Brassica juncea" },
        { label: "Common Names", value: "Mustard Seeds, Rai, Sarson" },
        { label: "Origin", value: "India" },
        { label: "Appearance", value: "Tiny, round, dark brown to black seeds" },
        { label: "Taste", value: "Sharp, pungent, slightly bitter when raw; nutty when tempered" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['seeds', 'spices']
    },
    {
      title: "Pumpkin Seeds",
      slug: "pumpkin-seeds",
      description: "<strong>Pumpkin Seeds</strong> (Kaddu ke Beej) are nutrient-dense, flat, oval-shaped green seeds known for their impressive health benefits. Our premium pumpkin seeds are raw, unshelled, and carefully processed to preserve their nutritional integrity. They are one of the best plant-based sources of zinc, magnesium, and iron, supporting immunity, heart health, and better sleep quality.",
      price: 299,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/pumpkin_seeds.png"],
        previews: ["/images/products/pumpkin_seeds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Raw, hulled (shell-removed) pumpkin seeds / pepitas",
        "<strong>Appearance:</strong> Flat, oval, dark green seeds",
        "<strong>Nutritional Value:</strong> One of the richest plant sources of zinc and magnesium. Also high in iron, phosphorus, manganese, healthy fats, protein, and tryptophan (supports sleep).",
        "<strong>Shelf Life:</strong> 6-8 months when stored in a cool, dry place"
      ],
      howToConsume: [
        "<strong>Raw Snacking:</strong> Eat a handful (30g) daily as a wholesome, crunchy snack.",
        "<strong>Roasted:</strong> Lightly roast in a dry pan with a pinch of salt and your choice of seasoning (paprika, cumin) for an irresistible snack.",
        "<strong>Smoothie Booster:</strong> Blend into smoothies for a protein, zinc, and magnesium boost.",
        "<strong>Salad Topping:</strong> Sprinkle over salads, soups, and grain bowls for added crunch and nutrition.",
        "<strong>In Baking:</strong> Add to granola bars, bread, muffins, and energy balls."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Raw Pumpkin Seeds (Pepitas)" },
        { label: "Botanical Name", value: "Cucurbita pepo" },
        { label: "Common Names", value: "Pumpkin Seeds, Pepitas, Kaddu ke Beej" },
        { label: "Origin", value: "India" },
        { label: "Appearance", value: "Flat, oval, dark green hulled seeds" },
        { label: "Taste", value: "Mildly nutty, slightly sweet, with a satisfying crunch" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place or refrigerate" }
      ],
      categories: ['seeds']
    },
    {
      title: "Sesame Seeds",
      slug: "sesame-seeds",
      description: "<strong>Sesame Seeds</strong> (Til) are one of the oldest oilseed crops known to humanity, treasured for their rich, nutty flavor and exceptional nutritional profile. Our premium white sesame seeds are clean, hulled, and ready to use. They are a powerhouse of calcium, iron, and healthy fats — making them essential for bone health, energy, and overall vitality.",
      price: 129,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/sesame_seeds.png"],
        previews: ["/images/products/sesame_seeds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> White hulled sesame seeds, cleaned and sorted",
        "<strong>Appearance:</strong> Tiny, flat, oval, creamy white seeds",
        "<strong>Nutritional Value:</strong> Exceptionally rich in calcium (more than milk per serving), iron, magnesium, zinc, and B vitamins. Contains sesamin and sesamolin — unique lignans with antioxidant properties.",
        "<strong>Shelf Life:</strong> 10-12 months when stored in an airtight container"
      ],
      howToConsume: [
        "<strong>Tadka / Tempering:</strong> Toast sesame seeds in oil as a finishing garnish for dals, chutneys, and stir-fries.",
        "<strong>Til Ladoo:</strong> Roast and mix with jaggery to make traditional Indian til ladoos — especially popular in winters and Makar Sankranti.",
        "<strong>Tahini:</strong> Roast and grind into a smooth paste (tahini) — the base for hummus, dressings, and Middle Eastern cuisine.",
        "<strong>In Baking:</strong> Sprinkle on bread, buns, and cookies before baking for a nutty crust.",
        "<strong>Smoothie & Salad Booster:</strong> Add to smoothies or sprinkle over salads for a calcium and iron boost."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium White Sesame Seeds (Safed Til)" },
        { label: "Botanical Name", value: "Sesamum indicum" },
        { label: "Common Names", value: "Sesame Seeds, Til, Gingelly Seeds" },
        { label: "Origin", value: "India" },
        { label: "Appearance", value: "Tiny, flat, oval, creamy white seeds" },
        { label: "Taste", value: "Rich, nutty, slightly sweet when toasted" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['seeds']
    },
    {
      title: "Sunflower Seeds",
      slug: "sunflower-seeds",
      description: "<strong>Sunflower Seeds</strong> are crunchy, nutrient-rich seeds harvested from the beautiful sunflower plant. Our premium sunflower seeds are raw, hulled, and ready to eat — making them a convenient and healthy snack. They are an outstanding source of Vitamin E, selenium, and healthy fats, supporting skin health, immunity, and cardiovascular wellness.",
      price: 179,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/sunflower_seeds.png"],
        previews: ["/images/products/sunflower_seeds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Raw, hulled (shell-removed) sunflower seed kernels",
        "<strong>Appearance:</strong> Small, flat, tear-drop shaped, pale greyish-white kernels",
        "<strong>Nutritional Value:</strong> One of the best sources of Vitamin E. Also rich in selenium, copper, manganese, phosphorus, B vitamins, and phytosterols that support heart health.",
        "<strong>Shelf Life:</strong> 6-8 months when stored in a cool, dry place"
      ],
      howToConsume: [
        "<strong>Raw Snacking:</strong> Enjoy a handful as a quick, filling snack rich in Vitamin E.",
        "<strong>Roasted:</strong> Dry roast or oven roast with a light seasoning of salt, pepper, or herbs for a crunchy treat.",
        "<strong>In Trail Mix:</strong> Combine with raisins, pumpkin seeds, and almonds for a balanced energy mix.",
        "<strong>Smoothie & Salad Topping:</strong> Sprinkle over smoothie bowls, salads, and grain bowls for added crunch and nutrition.",
        "<strong>Sunflower Seed Butter:</strong> Roast and blend into a smooth butter — a great nut-free alternative to peanut butter."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Raw Sunflower Seed Kernels" },
        { label: "Botanical Name", value: "Helianthus annuus" },
        { label: "Common Names", value: "Sunflower Seeds, Surajmukhi ke Beej" },
        { label: "Origin", value: "India" },
        { label: "Appearance", value: "Small, flat, pale greyish-white hulled kernels" },
        { label: "Taste", value: "Mild, nutty, slightly sweet with a tender crunch" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['seeds']
    },

    // ── Spices ──
    {
      title: "Black Garlic",
      slug: "black-garlic",
      description: "<strong>Black Garlic</strong> is a culinary delicacy created by slowly aging whole bulbs of fresh garlic under controlled heat and humidity for several weeks. This careful fermentation transforms the sharp, pungent cloves into soft, jet-black, sweet, and umami-rich morsels. Our black garlic is naturally produced with no additives — a gourmet ingredient prized by chefs worldwide for its complex flavor and impressive antioxidant properties.",
      price: 599,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: ["/images/products/black_garlic.png"],
        previews: ["/images/products/black_garlic.png"]
      },
      specifications: [
        "<strong>Process:</strong> Naturally fermented whole garlic bulbs, aged for 40-60 days under controlled conditions",
        "<strong>Appearance:</strong> Jet-black, soft, sticky cloves with a jelly-like consistency",
        "<strong>Nutritional Value:</strong> Contains significantly higher levels of antioxidants (S-allyl cysteine) compared to raw garlic. Rich in amino acids, natural sugars, and bioactive compounds.",
        "<strong>Shelf Life:</strong> 3-6 months when stored in an airtight container in a cool, dry place"
      ],
      howToConsume: [
        "<strong>Eat Directly:</strong> Enjoy 1-2 cloves daily as a health supplement. The sweet, molasses-like flavor makes it pleasant to eat raw.",
        "<strong>Spread:</strong> Mash and spread on toast, crackers, or bruschetta for a gourmet appetizer.",
        "<strong>In Cooking:</strong> Add to pasta sauces, risottos, stir-fries, and marinades for a deep, sweet umami flavor without the harsh bite of raw garlic.",
        "<strong>Dressings & Dips:</strong> Blend into aioli, hummus, or salad dressings for a sophisticated flavor twist.",
        "<strong>On Pizza & Burgers:</strong> Slice and add as a premium topping that elevates any dish."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Fermented Black Garlic" },
        { label: "Botanical Name", value: "Allium sativum (fermented)" },
        { label: "Common Names", value: "Black Garlic, Aged Garlic" },
        { label: "Origin", value: "Dehradun, India" },
        { label: "Appearance", value: "Jet-black, soft, sticky cloves" },
        { label: "Taste", value: "Sweet, tangy, umami-rich with notes of balsamic vinegar and molasses" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place" }
      ],
      categories: ['spices']
    },
    {
      title: "Black Pepper",
      slug: "black-pepper",
      description: "<strong>Black Pepper</strong> (Kali Mirch), known as the \"King of Spices,\" is the world's most traded and widely used spice. Our premium whole black peppercorns are sourced from the finest plantations, sun-dried to perfection, and packed with piperine — the compound responsible for its signature heat and remarkable health benefits. It enhances nutrient absorption, supports digestion, and adds a bold kick to any dish.",
      price: 199,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/black_pepper.png"],
        previews: ["/images/products/black_pepper.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Whole black peppercorns, Malabar / Tellicherry grade",
        "<strong>Appearance:</strong> Small, round, dark brown to black wrinkled berries",
        "<strong>Nutritional Value:</strong> Rich in piperine (enhances bioavailability of other nutrients like turmeric's curcumin by up to 2000%). Contains manganese, Vitamin K, iron, and dietary fiber.",
        "<strong>Shelf Life:</strong> 18-24 months for whole peppercorns when stored properly"
      ],
      howToConsume: [
        "<strong>Freshly Ground:</strong> Use a pepper mill to crack whole peppercorns over dishes for the freshest, most aromatic flavor.",
        "<strong>In Cooking:</strong> Add whole peppercorns to curries, soups, stews, and rice dishes (biryani, pulao) for a slow-release warmth.",
        "<strong>Golden Milk:</strong> Add a pinch of freshly ground black pepper to turmeric milk (haldi doodh) — piperine enhances curcumin absorption by up to 2000%.",
        "<strong>In Marinades:</strong> Crack and press into steaks, chicken, and fish before grilling or pan-searing.",
        "<strong>Black Pepper Tea:</strong> Brew with ginger, honey, and tulsi leaves for a warming, immunity-boosting kadha."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Whole Black Peppercorns (Kali Mirch)" },
        { label: "Botanical Name", value: "Piper nigrum" },
        { label: "Common Names", value: "Black Pepper, Kali Mirch, King of Spices" },
        { label: "Origin", value: "Kerala / Karnataka, India" },
        { label: "Appearance", value: "Small, round, dark brown to black wrinkled berries" },
        { label: "Taste", value: "Sharp, pungent, warm, and slightly woody" },
        { label: "Storage", value: "Store whole peppercorns in an airtight container away from heat and light" }
      ],
      categories: ['spices']
    },
    {
      title: "Premium Cloves",
      slug: "premium-cloves",
      description: "<strong>Premium Cloves</strong> (Laung) are intensely aromatic flower buds from the clove tree, used for centuries in cooking, medicine, and dentistry. Our whole cloves are hand-picked, sun-dried, and bursting with eugenol — a powerful compound responsible for their distinctive warm, sweet aroma and potent antiseptic properties. They are indispensable in Indian spice blends, teas, and traditional remedies.",
      price: 299,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/clove.png"],
        previews: ["/images/products/clove.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Whole, hand-picked clove buds, premium grade",
        "<strong>Appearance:</strong> Small, dark brown, nail-shaped dried flower buds with a rounded head",
        "<strong>Nutritional Value:</strong> One of the richest sources of eugenol (up to 90% of clove essential oil). Also contains manganese, Vitamin K, Vitamin C, fiber, and potent antioxidants (highest ORAC value among spices).",
        "<strong>Shelf Life:</strong> 18-24 months when stored in an airtight container"
      ],
      howToConsume: [
        "<strong>In Garam Masala:</strong> A key ingredient in garam masala and other spice blends. Add whole cloves while tempering oil or roast and grind into powder.",
        "<strong>Chai / Tea:</strong> Add 2-3 cloves while brewing tea or chai for a warm, aromatic flavor. Popular in masala chai.",
        "<strong>In Rice Dishes:</strong> Add whole cloves to biryani, pulao, and rice dishes for a fragrant, warm note.",
        "<strong>Dental Relief:</strong> Chew a clove or apply clove oil for temporary relief from toothaches — a time-tested home remedy.",
        "<strong>Kadha / Immunity Drink:</strong> Boil with ginger, black pepper, tulsi, and honey for a powerful immunity-boosting decoction."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Whole Cloves (Laung)" },
        { label: "Botanical Name", value: "Syzygium aromaticum" },
        { label: "Common Names", value: "Cloves, Laung, Lavang" },
        { label: "Origin", value: "Kerala / Tamil Nadu, India" },
        { label: "Appearance", value: "Small, dark brown, nail-shaped dried flower buds" },
        { label: "Taste", value: "Intensely warm, sweet, slightly bitter, and numbing" },
        { label: "Storage", value: "Store whole cloves in an airtight container away from moisture and light" }
      ],
      categories: ['spices']
    },
    {
      title: "Cumin Seeds",
      slug: "cumin-seeds",
      description: "<strong>Cumin Seeds</strong> (Jeera) are one of the most essential spices in Indian and global cuisine, known for their earthy, warm, and slightly nutty flavor. Our premium cumin seeds are whole, clean, and highly aromatic — perfect for tempering, roasting, and grinding. Beyond flavor, cumin is celebrated for its digestive benefits and is a rich source of iron and antioxidants.",
      price: 149,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/cumin_seeds.png"],
        previews: ["/images/products/cumin_seeds.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Whole cumin seeds, bold grade, cleaned and sorted",
        "<strong>Appearance:</strong> Small, elongated, ridged, light brown to olive-green seeds",
        "<strong>Nutritional Value:</strong> Excellent source of iron (one teaspoon provides ~20% daily value). Rich in manganese, calcium, magnesium, and thymoquinone — a compound with anti-inflammatory properties.",
        "<strong>Shelf Life:</strong> 12-18 months when stored in an airtight container"
      ],
      howToConsume: [
        "<strong>Tadka / Tempering:</strong> Heat oil or ghee, add cumin seeds until they splutter and turn fragrant — the foundation of countless Indian dishes like dal, sabzi, and kadhi.",
        "<strong>Jeera Water:</strong> Boil 1 teaspoon of cumin seeds in water for 5 minutes, strain, and drink warm. Excellent for digestion, bloating, and metabolism.",
        "<strong>Roasted Cumin Powder:</strong> Dry roast seeds until dark and fragrant, then grind. Sprinkle over raita, chaas, chaat, and salads.",
        "<strong>In Spice Blends:</strong> A key ingredient in garam masala, curry powder, chili powder, and many regional spice mixes.",
        "<strong>In Baking & Breads:</strong> Add to bread dough, crackers, and savory baked goods for an earthy, aromatic flavor."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Whole Cumin Seeds (Jeera)" },
        { label: "Botanical Name", value: "Cuminum cyminum" },
        { label: "Common Names", value: "Cumin, Jeera, Zeera" },
        { label: "Origin", value: "Rajasthan / Gujarat, India" },
        { label: "Appearance", value: "Small, elongated, ridged, light brown seeds" },
        { label: "Taste", value: "Warm, earthy, slightly nutty and peppery" },
        { label: "Storage", value: "Store in an airtight container in a cool, dry place away from light" }
      ],
      categories: ['spices']
    },
    {
      title: "Himalayan Garlic",
      slug: "himalayan-garlic",
      description: "<strong>Himalayan Garlic</strong> (Pahadi Lahsun) is a rare, single-clove garlic variety that grows wild in the high-altitude regions of the Himalayas. Unlike regular garlic, each bulb contains just one potent clove — packed with significantly higher concentrations of allicin and other bioactive compounds. Revered in Ayurveda for its medicinal properties, this garlic is believed to support cardiovascular health, immunity, and respiratory function.",
      price: 499,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: false,
      imgs: {
        thumbnails: ["/images/products/himalayan_garlic.png"],
        previews: ["/images/products/himalayan_garlic.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Single-clove Himalayan garlic (Ek Pothi Lahsun), naturally grown at high altitudes",
        "<strong>Appearance:</strong> Small, round, single-clove bulbs with a light papery skin. Each bulb is one solid clove.",
        "<strong>Nutritional Value:</strong> Contains 5-6x more allicin than regular garlic. Rich in Vitamin C, Vitamin B6, manganese, selenium, and sulfur compounds with potent antimicrobial and anti-inflammatory properties.",
        "<strong>Shelf Life:</strong> 3-4 months at room temperature; longer when refrigerated"
      ],
      howToConsume: [
        "<strong>Raw on Empty Stomach:</strong> Chew 1-2 cloves with warm water first thing in the morning for maximum health benefits — supports heart health and immunity.",
        "<strong>In Cooking:</strong> Use as a direct substitute for regular garlic in any recipe. Its concentrated flavor means you need less — 1 Himalayan clove replaces 3-4 regular cloves.",
        "<strong>Honey Garlic:</strong> Soak peeled cloves in raw honey for 2-3 weeks. Eat one honey-soaked clove daily as a powerful natural remedy.",
        "<strong>In Pickles:</strong> Make traditional Pahadi garlic pickle with mustard oil and spices — a delicacy in Uttarakhand and Himachal Pradesh.",
        "<strong>Garlic Chutney:</strong> Grind with red chilies, salt, and lemon juice for a fiery, flavorful chutney."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Himalayan Single-Clove Garlic (Pahadi Lahsun)" },
        { label: "Botanical Name", value: "Allium sativum var. pekinense" },
        { label: "Common Names", value: "Himalayan Garlic, Pahadi Lahsun, Ek Pothi Lahsun, Snow Mountain Garlic" },
        { label: "Origin", value: "Uttarakhand / Himachal Pradesh, India" },
        { label: "Appearance", value: "Small, round, single-clove bulbs with papery white skin" },
        { label: "Taste", value: "Intensely pungent, sharper and more concentrated than regular garlic" },
        { label: "Storage", value: "Store in a cool, dry, ventilated place. Refrigerate for longer storage." }
      ],
      categories: ['spices']
    },
    {
      title: "Himalayan Turmeric",
      slug: "himalayan-turmeric",
      description: "<strong>Himalayan Turmeric</strong> (Pahadi Haldi) is a premium, high-curcumin variety of turmeric grown in the pristine, unpolluted regions of the Himalayas. Unlike commercially grown turmeric, this variety contains significantly higher levels of curcumin — the active compound responsible for turmeric's powerful anti-inflammatory, antioxidant, and healing properties. Its deep golden-orange color and intense earthy aroma set it apart from regular turmeric.",
      price: 249,
      measurementValue: 200,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: ["/images/products/himalayan_turmeric.png"],
        previews: ["/images/products/himalayan_turmeric.png"]
      },
      specifications: [
        "<strong>Variety:</strong> Himalayan Lakadong / Wild Turmeric, naturally grown at high altitudes",
        "<strong>Appearance:</strong> Deep golden-orange powder with a rich, intense color. Whole rhizomes are dark brown externally with a bright orange interior.",
        "<strong>Nutritional Value:</strong> Contains 7-9% curcumin (compared to 2-3% in regular turmeric). Rich in curcuminoids, volatile oils (turmerone, atlantone), iron, manganese, Vitamin B6, and potassium.",
        "<strong>Shelf Life:</strong> 12-18 months when stored in an airtight container away from light"
      ],
      howToConsume: [
        "<strong>Golden Milk (Haldi Doodh):</strong> Mix ½ teaspoon of turmeric powder in warm milk with a pinch of black pepper (to enhance curcumin absorption by 2000%). Add honey to taste.",
        "<strong>In Cooking:</strong> Use in curries, dals, rice dishes, and soups. Its intense color and flavor mean you need less than regular turmeric.",
        "<strong>Turmeric Tea / Kadha:</strong> Boil with ginger, black pepper, and honey for a powerful anti-inflammatory and immunity-boosting drink.",
        "<strong>Face Mask:</strong> Mix with honey or yogurt for a traditional Ayurvedic face mask that brightens skin and reduces inflammation.",
        "<strong>Turmeric Paste:</strong> Make a concentrated paste (with water and black pepper) and store in the fridge. Add to dishes, drinks, or apply topically."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Premium Himalayan Turmeric Powder (Pahadi Haldi)" },
        { label: "Botanical Name", value: "Curcuma longa" },
        { label: "Common Names", value: "Turmeric, Haldi, Pahadi Haldi, Indian Saffron" },
        { label: "Origin", value: "Uttarakhand / Meghalaya (Lakadong), India" },
        { label: "Appearance", value: "Deep golden-orange powder, vibrant and richly pigmented" },
        { label: "Taste", value: "Warm, earthy, slightly bitter with a peppery undertone" },
        { label: "Storage", value: "Store in an airtight, opaque container away from light and moisture" }
      ],
      categories: ['spices']
    }
  ]

  for (const productData of products) {
    const { categories: categoryNames, ...productInfo } = productData

    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      // Update existing products so new fields (like imgs) are applied
      update: productInfo,
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
      views: 0,
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
