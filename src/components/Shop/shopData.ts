import { Product } from "@/types/product";
const shopData: Product[] = [
  {
    title: "Ganoderma lucidum",
    reviews: 3,
    price: 999,
    discountedPrice: 899,
    id: 1,
    imgs: {
      thumbnails: [
        "/images/products/ganoderma_sticker.png",
        "/images/products/ganoderma.png",
        "/images/products/ganoderma_package.png",
        "/images/products/ganoderma_specs.png",
      ],
      previews: [
        "/images/products/ganoderma_sticker.png",
        "/images/products/ganoderma.png",
        "/images/products/ganoderma_package.png",
        "/images/products/ganoderma_specs.png",
      ],
    },
    description: "Our <strong>Ganoderma lucidum</strong>, commonly known as Reishi or Lingzhi, is cultivated and processed under the strictest quality standards to deliver a product of exceptional purity and potency. Revered for centuries in traditional medicine as the &quot;Mushroom of Immortality,&quot; our Reishi extract is designed to support modern wellness goals.",
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
     { label: "Odor", value: "Mild, earthy aroma" },
   ],
    reviewsList: [
{
        "name": "Anjali",
        "role": "Home Chef",
        "rating": 5,
        "comment": "Absolutely fresh and delicious! They were perfect for my pasta dish. The mild, savory flavor is just unbeatable.",
        "avatar": "/images/users/user-03.jpg"
      },
      {
        "name": "Rohan Singh",
        "role": "Urban Farmer",
        "rating": 5,
        "comment": "The spawn was of excellent quality. I got a massive first flush from my grow bags here in Dehradun. Very happy.",
        "avatar": "/images/users/user-04.jpg"
      },
      {
        "name": "Priya Sharma",
        "role": "Food Blogger",
        "rating": 4,
        "comment": "Lovely texture and very versatile in the kitchen. They stir-fry beautifully. A bit pricey, but the quality is worth it.",
        "avatar": "/images/users/user-05.jpg"
      },
    ],
  },
  {
    title: "Oyster Mushroom",
    reviews: 5,
    price: 169,
    discountedPrice: 149,
    id: 2,
    imgs: {
      thumbnails: [
        "/images/products/oyster_sticker.png",
        "/images/products/oyster.png",
        "/images/products/oyster_package.png",
      ],
      previews: [
        "/images/products/oyster_sticker.png",
        "/images/products/oyster.png",
        "/images/products/oyster_package.png",
      ],
    },
    description: "<strong>Oyster mushrooms</strong>, scientifically known as <strong>Pleurotus</strong>, are a popular and versatile variety of edible fungi cherished for their delicate flavor and velvety texture. Their name is derived from their characteristic shell-like appearance, with a cap that resembles an oyster. Found in temperate and tropical forests worldwide, they typically grow in shelf-like clusters on dead or dying deciduous trees",
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
  "additionalInfo": [
    { "label": "Product Name", "value": "Organic Oyster Mushroom Powder (or Fresh/Dried)" },
    { "label": "Botanical Name", "value": "Pleurotus ostreatus" },
    { "label": "Common Names", "value": "Oyster Mushroom, Pearl Oyster Mushroom, Dhingri (in India)" },
    { "label": "Part Used", "value": "100% Fruiting Body" },
    { "label": "Appearance", "value": "Fresh: Fan-shaped, white to greyish-brown. Powder: Light beige to tan." },
    { "label": "Taste", "value": "Mild, savory, subtly sweet with a velvety texture" },
    { "label": "Odor", "value": "Delicate, earthy aroma, sometimes with a faint hint of anise" }
  ],
  reviewsList: [
      {
        "name": "Sameer",
        "role": "Restaurant Owner",
        "rating": 5,
        "comment": "Consistent quality and size, which is crucial for my restaurant. Our customers love the cream of oyster mushroom soup we make.",
        "avatar": "/images/users/user-06.jpg"
      },
      {
        "name": "Kavita",
        "role": "Health Enthusiast",
        "rating": 4,
        "comment": "A fantastic, low-calorie source of protein. I add them to my salads and omelettes. Wish they offered a subscription service.",
        "avatar": "/images/users/user-07.jpg"
      },
      {
        "name": "Deepak Kumar",
        "role": "Mushroom Hobbyist",
        "rating": 3,
        "comment": "The grow kit worked, but the yield was smaller than I expected. The mushrooms that did grow tasted good though.",
        "avatar": "/images/users/user-08.jpg"
      }
    ],
  },
      {
    title: "Chantrelle",
    reviews: 6,
    price: 699,
    discountedPrice: 629,
    id: 3,
    imgs: {
      thumbnails: [
        "/images/products/chantrelle_sticker.png",
        "/images/products/chantrelle.png",
        "/images/products/chantrelle_package.png",
      ],
      previews: [
       "/images/products/chantrelle_sticker.png",
       "/images/products/chantrelle.png",
       "/images/products/chantrelle_package.png",
      ],
    },
  "description": "Chanterelle <i>(Cantharellus cibarius)</i> is a celebrated wild mushroom, famous for its beautiful golden color, delicate texture, and a subtle, fruity aroma reminiscent of apricots. Unlike cultivated mushrooms, chanterelles are foraged from forests, growing in symbiotic relationships with trees. They are a true gourmet delicacy, sought after by chefs and food lovers around the world.",
  "specifications": [
    "<strong>Appearance</strong>: Chanterelles are typically trumpet or funnel-shaped, with a wavy, irregular cap. Their color ranges from a vibrant yellow to a deep golden-orange. Instead of true gills, they have distinctive blunt, forked ridges that run down the stem.",
    "<strong>Flavor and Aroma</strong>: They have a unique and complex flavor that is both peppery and fruity, with distinct notes of apricot or peach. The texture is wonderfully chewy and firm, yet tender when cooked.",
    "<strong>Nutritional Value</strong>: Chanterelles are a great source of vitamins D and B, particularly niacin and riboflavin. They also provide essential minerals like iron and potassium, and are rich in polysaccharides, which are known for their immune-supporting properties."
  ],
  "howToConsume": [
    "<strong>Simple Sauté</strong>: This is the best way to enjoy their unique flavor. Sauté them in butter or olive oil with a little garlic and fresh thyme or parsley. Their flavor is delicate, so they don't need much.",
    "<strong>Creamy Sauces</strong>: Chanterelles are famously used in creamy pasta sauces or served over steak or chicken. Their firm texture holds up beautifully in rich sauces.",
    "<strong>Soups and Risottos</strong>: Add them to risottos or creamy soups to impart a luxurious, earthy, and fruity flavor.",
    "<strong>Preserving</strong>: Chanterelles don't rehydrate well from a fully dried state. The best way to preserve them is to sauté them first and then freeze them in an airtight container."
  ],
  "additionalInfo": [
    { "label": "Product Name", "value": "Wild Foraged Chanterelle Mushrooms (Fresh)" },
    { "label": "Botanical Name", "value": "Cantharellus cibarius" },
    { "label": "Common Names", "value": "Chanterelle, Golden Chanterelle, Girolle" },
    { "label": "Part Used", "value": "100% Fruiting Body" },
    { "label": "Appearance", "value": "Fresh: Golden-orange, trumpet-shaped with forked ridges." },
    { "label": "Taste", "value": "Delicate, peppery, and fruity with notes of apricot" },
    { "label": "Odor", "value": "Distinctive fruity aroma, often compared to apricots" }
  ],
  reviewsList: [
{
        "name": "Geeta Negi",
        "role": "Local Resident",
        "rating": 5,
        "comment": "Ordered these for a family dinner. They were incredibly fresh, much better than the Sabzi Mandi. Made a delicious Pahadi-style mushroom stir-fry.",
        "avatar": "/images/users/user-12.jpg"
      },
      {
        "name": "Sandeep",
        "role": "Hotel Supplier",
        "rating": 4,
        "comment": "Good bulk pricing and dependable quality for our hotel kitchen. Sometimes the delivery schedule can be a bit rigid, but the product is solid.",
        "avatar": "/images/users/user-13.jpg"
      },
      {
        "name": "Pooja",
        "role": "Student",
        "rating": 5,
        "comment": "The grow kit is a fantastic project. It's so cool to watch them grow right in my room, especially during this monsoon season. And they taste amazing!",
        "avatar": "/images/users/user-14.jpg"
      },
    ],
  },

  {
    title: "Shitake",
    reviews: 6,
    price: 499,
    discountedPrice: 449,
    id: 4,
    imgs: {
      thumbnails: [
        "/images/products/shitake_sticker.png",
        "/images/products/shitake.png",
        "/images/products/shitake_package.png",
      ],
      previews: [
       "/images/products/shitake_sticker.png",
       "/images/products/shitake.png",
       "/images/products/shitake_package.png",
      ],
    },
      "description": "Shiitake <i>(Lentinula edodes)</i> is one of the most popular and cultivated mushrooms worldwide, prized for its rich, savory taste and significant health benefits. Native to East Asia, it grows on decaying hardwood trees and has been a staple in Asian cuisine and traditional medicine for centuries. Its deep, umami flavor makes it a culinary cornerstone in many dishes.",
  "specifications": [
    "<strong>Appearance</strong>: Shiitake mushrooms have a distinct umbrella-shaped cap, typically ranging from 5 to 10 centimeters in diameter. The cap is light to dark brown, often with a slightly cracked or scaly texture on the surface. The gills underneath are white to light brown, and the stem is tough, fibrous, and usually removed before cooking.",
    "<strong>Flavor and Aroma</strong>: Shiitakes are renowned for their potent umami (savory) flavor, which is rich, smoky, and earthy. The aroma is equally robust and distinctive. When cooked, they develop a dense, meaty texture that is satisfyingly chewy.",
    "<strong>Nutritional Value</strong>: These mushrooms are an excellent source of B vitamins (especially pantothenic acid and B6), copper, selenium, manganese, and zinc. They are also rich in polysaccharides like lentinan and other unique bioactive compounds, which are studied for their immune-boosting and cholesterol-lowering properties."
  ],
  "howToConsume": [
    "<strong>Sautéing and Stir-frying</strong>: This is a classic method that intensifies their flavor. Slice the caps and sauté in oil or butter with garlic and soy sauce. Their robust texture holds up well in stir-fries with other vegetables and proteins.",
    "<strong>Roasting</strong>: Roasting shiitakes brings out a deeper, more concentrated savory flavor. Toss whole or halved caps with oil and seasonings and roast at 200°C (400°F) for 15-20 minutes until the edges are caramelized and crispy.",
    "<strong>Soups and Broths</strong>: Shiitakes are essential for adding a deep, savory foundation to soups and broths, like Japanese miso soup or dashi stock. Both fresh and rehydrated dried mushrooms can be used.",
    "<strong>Grilling</strong>: Thread whole shiitake caps onto skewers, marinate them in a savory glaze (like teriyaki), and grill until tender and slightly charred. The tough stems can be used to flavor stocks and broths.",
    "<strong>Using Dried Shiitakes</strong>: Dried shiitakes have a more intense flavor than fresh ones. To use, rehydrate them in warm water for 20-30 minutes until soft. The flavorful soaking liquid can be strained and used as a broth in your recipe.",
    "<i>Medicinal Consumption: For centuries, shiitake has been used in traditional medicine for its health-promoting properties. Today, it is available in concentrated forms for therapeutic use:</i>",
    "<strong>Supplements</strong>: Shiitake extract is available in capsules, powders, and tinctures, primarily used to support immune function and cardiovascular health."
  ],
  "additionalInfo": [
    { "label": "Product Name", "value": "Organic Shiitake Mushroom Powder (or Fresh/Dried)" },
    { "label": "Botanical Name", "value": "Lentinula edodes" },
    { "label": "Common Names", "value": "Shiitake, Forest Mushroom, Oak Mushroom" },
    { "label": "Part Used", "value": "100% Fruiting Body" },
    { "label": "Appearance", "value": "Fresh: Brown, umbrella-shaped cap with a fibrous stem. Powder: Light to medium brown." },
    { "label": "Taste", "value": "Rich, umami, smoky, and earthy with a meaty texture" },
    { "label": "Odor", "value": "Distinctive, savory, and earthy aroma" }
  ],
  reviewsList: [
{
        "name": "Geeta Negi",
        "role": "Local Resident",
        "rating": 5,
        "comment": "Ordered these for a family dinner. They were incredibly fresh, much better than the Sabzi Mandi. Made a delicious Pahadi-style mushroom stir-fry.",
        "avatar": "/images/users/user-12.jpg"
      },
      {
        "name": "Sandeep",
        "role": "Hotel Supplier",
        "rating": 4,
        "comment": "Good bulk pricing and dependable quality for our hotel kitchen. Sometimes the delivery schedule can be a bit rigid, but the product is solid.",
        "avatar": "/images/users/user-13.jpg"
      },
      {
        "name": "Pooja",
        "role": "Student",
        "rating": 5,
        "comment": "The grow kit is a fantastic project. It's so cool to watch them grow right in my room, especially during this monsoon season. And they taste amazing!",
        "avatar": "/images/users/user-14.jpg"
      },
    ],
  },
    {
    title: "Lion's Mane",
    reviews: 5,
    price: 1599,
    discountedPrice: 1439,
    id: 5,
    imgs: {
      thumbnails: [
        "/images/products/lions_mane.png",
      ],
      previews: [
        "/images/products/lions_mane.png",
      ],
    },
    description: "Lion's Mane (Hericium erinaceus), also known as the \"pom-pom mushroom,\" is a unique and increasingly popular edible and medicinal fungus. Its striking appearance and remarkable health benefits have garnered significant attention in both culinary and wellness circles. Native to North America, Europe, and Asia, this mushroom typically grows on dead or dying hardwood trees, particularly oak and beech.",
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
    "<i>Medicinal Consumption: Beyond its culinary uses, Lion's Mane is widely consumed for its potential health benefits, particularly for cognitive function. For this purpose, it is available in various forms:</i",
    "<strong>Supplements</strong>: Capsules, powders, and tinctures are popular ways to consume Lion's Mane for its medicinal properties. These can be found at health food stores and online.",
    "<strong>Mushroom Coffee and Tea</strong>: Lion's Mane powder is often added to coffee, tea, and other beverages for a daily cognitive boost."
  ],
    "additionalInfo": [
    { "label": "Product Name", "value": "Organic Lion's Mane Mushroom Powder (or Fresh/Dried)" },
    { "label": "Botanical Name", "value": "Hericium erinaceus" },
    { "label": "Common Names", "value": "Lion's Mane, Pom Pom Mushroom, Yamabushitake" },
    { "label": "Part Used", "value": "100% Fruiting Body" },
    { "label": "Appearance", "value": "Fresh: White, cascading, icicle-like spines. Powder: Creamy white to light beige." },
    { "label": "Taste", "value": "Savory and mild, with a texture and flavor reminiscent of crab or lobster" },
    { "label": "Odor", "value": "Subtle, earthy, and slightly sweet" }
  ],
    reviewsList: [
 {
        "name": "Sunita Devi",
        "role": "Home Gardener",
        "rating": 5,
        "comment": "My first time growing mushrooms! The kit was so easy to use here in the Dehradun climate. I got my first harvest in just over a week. So fresh!",
        "avatar": "/images/users/user-09.jpg"
      },
      {
        "name": "Manish Bist",
        "role": "Cafe Owner",
        "rating": 5,
        "comment": "We use these for our cafe's special mushroom sandwich. The quality is consistently top-notch. Fast and reliable local delivery.",
        "avatar": "/images/users/user-10.jpg"
      },
      {
        "name": "Ajay Verma",
        "role": "Fitness Trainer",
        "rating": 4,
        "comment": "Excellent source of lean protein. The last batch was a bit smaller than usual, but the freshness is always reliable.",
        "avatar": "/images/users/user-11.jpg"
      },
    ],
  },
];

export default shopData;
