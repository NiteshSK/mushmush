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
      where: { slug: 'spat-spawn' },
      update: {
        title: 'Spat/Spawn',
        img: '/images/categories/seed_spawn.png',
        path: '/shop?category=spat-spawn',
        description: 'Mushroom spawn and spore cultures for cultivation'
      },
      create: {
        title: 'Spat/Spawn',
        slug: 'spat-spawn',
        img: '/images/categories/seed_spawn.png',
        path: '/shop?category=spat-spawn',
        description: 'Mushroom spawn and spore cultures for cultivation'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'nuts' },
      update: {
        title: 'Nuts',
        img: '/images/categories/nuts.png',
        path: '/shop?category=nuts',
        description: 'Premium nuts and dry fruits'
      },
      create: {
        title: 'Nuts',
        slug: 'nuts',
        img: '/images/categories/nuts.png',
        path: '/shop?category=nuts',
        description: 'Premium nuts and dry fruits'
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
      slug: "lions-mane",
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
      slug: "ganoderma-tincture",
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
        { label: "Taste", value: "Characteristically bitter and earthy" },
        { label: "Odor", value: "Mild, woody, and earthy aroma" }
      ],
      categories: ['tinctures', 'medicinal']
    },
    {
      title: "Turkey Tail",
      slug: "turkey-tail",
      description: "<strong>Turkey Tail</strong> (<i>Trametes versicolor</i>) is one of the most researched medicinal mushrooms in the world, renowned for its powerful immune-supporting properties. Named for its striking resemblance to a wild turkey's tail feathers, this mushroom displays beautiful concentric zones of various colors including brown, tan, gray, and blue. It has been used in traditional Chinese medicine for centuries and is now widely studied for its health benefits.",
      price: 899,
      measurementValue: 100,
      measurementType: "gm",
      inStock: true,
      featured: true,
      imgs: {
        thumbnails: [
          "/images/products/turkey_tail.png",
        ],
        previews: [
          "/images/products/turkey_tail.png",
        ]
      },
      specifications: [
        "<strong>Appearance</strong>: Turkey Tail mushrooms grow in overlapping shelf-like formations on dead or dying hardwood trees. The caps display distinctive multicolored concentric zones that resemble the tail feathers of a wild turkey. The underside is white to cream-colored with tiny pores.",
        "<strong>Active Compounds</strong>: Rich in polysaccharide-K (PSK) and polysaccharide-peptide (PSP), which are among the most extensively researched immune-supporting compounds. Also contains beta-glucans, antioxidants, and prebiotics.",
        "<strong>Nutritional Value</strong>: Excellent source of antioxidants, B vitamins, and minerals. Contains unique bioactive compounds that support gut health and immune function."
      ],
      howToConsume: [
        "<strong>As a Tea</strong>: Simmer dried Turkey Tail slices or powder in water for 30-60 minutes to create a medicinal tea. The longer you simmer, the more compounds are extracted. Add honey or lemon to taste.",
        "<strong>In Powder Form</strong>: Mix Turkey Tail powder into smoothies, coffee, or other beverages. Start with 1-2 grams per day and adjust as needed.",
        "<strong>Capsules</strong>: For convenience, take Turkey Tail in capsule form as a daily supplement. Follow dosage instructions on the product label.",
        "<strong>Tincture</strong>: Alcohol-based tinctures provide concentrated extracts. Take sublingually or add to beverages.",
        "<strong>In Soups and Broths</strong>: Add dried Turkey Tail to bone broths or vegetable stocks for both flavor and health benefits. Strain before consuming."
      ],
      additionalInfo: [
        { label: "Product Name", value: "Organic Turkey Tail Mushroom Powder" },
        { label: "Botanical Name", value: "Trametes versicolor" },
        { label: "Common Names", value: "Turkey Tail, Yun Zhi, Kawaratake" },
        { label: "Part Used", value: "100% Fruiting Body" },
        { label: "Appearance", value: "Fine, light brown to tan powder" },
        { label: "Taste", value: "Mild, slightly earthy" },
        { label: "Odor", value: "Subtle, earthy aroma" }
      ],
      categories: ['medicinal', 'powders']
    }
    // Add more products as needed...
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
