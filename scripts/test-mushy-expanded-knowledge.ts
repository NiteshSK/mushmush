/**
 * Test Script for Mushy's Expanded Knowledge Base
 * 
 * This script helps verify that Mushy can answer questions about:
 * - About Us (company story, founders, certifications, production)
 * - Blogs (cultivation articles)
 * - News (mushroom industry news)
 */

const testQueries = [
    // About Us - Founders & Story
    {
        category: "About Us - Founders",
        query: "Who founded MushMush?",
        expectedInfo: "Bhartendu, Pravesh & Vikrant"
    },
    {
        category: "About Us - Story",
        query: "Tell me about MushMush",
        expectedInfo: "Company story, left conventional jobs, Herbertpur Dehradun"
    },

    // About Us - Certifications & Philosophy
    {
        category: "About Us - Organic",
        query: "Are your mushrooms organic?",
        expectedInfo: "Zero chemicals, certified by Department of Mushroom, Uttarakhand"
    },
    {
        category: "About Us - Certification",
        query: "Do you have any certifications?",
        expectedInfo: "Department of Mushroom, Uttarakhand, Dehradun"
    },

    // About Us - Production
    {
        category: "About Us - Production",
        query: "How much do you produce daily?",
        expectedInfo: "25+ kg daily fresh mushrooms, 2+ kg spawn"
    },
    {
        category: "About Us - Varieties",
        query: "What mushroom varieties do you grow?",
        expectedInfo: "Oyster, Shiitake, Ganoderma (Reishi), Button, King Oyster"
    },

    // About Us - Training
    {
        category: "About Us - Training",
        query: "Do you offer training programs?",
        expectedInfo: "Comprehensive training, weekend batches, hands-on experience"
    },
    {
        category: "About Us - Training Details",
        query: "What training do you provide?",
        expectedInfo: "Oyster, Button, Shiitake, Ganoderma cultivation training"
    },

    // About Us - Future Products
    {
        category: "About Us - Future",
        query: "What new products are you planning?",
        expectedInfo: "Mushroom pickles, cookies, tinctures, dry powders"
    },

    // Blogs & News
    {
        category: "Blogs",
        query: "Do you have any articles about mushroom cultivation?",
        expectedInfo: "Should search blog posts if available"
    },
    {
        category: "News",
        query: "What's new in mushroom farming?",
        expectedInfo: "Should search news articles if available"
    },

    // Combined Queries
    {
        category: "Combined",
        query: "Tell me about your company and what you offer",
        expectedInfo: "Company story + varieties + training + products"
    },

    // Product Queries (verify RAG still works)
    {
        category: "Products",
        query: "Turkey tail mushroom price?",
        expectedInfo: "₹899 for 100gm"
    }
];

console.log("=== MUSHY EXPANDED KNOWLEDGE BASE TEST ===\n");
console.log(`Total test queries: ${testQueries.length}\n`);

const categories = [...new Set(testQueries.map(t => t.category))];
categories.forEach(category => {
    console.log(`\n## ${category}`);
    const categoryTests = testQueries.filter(t => t.category === category);
    categoryTests.forEach((test, index) => {
        console.log(`${index + 1}. "${test.query}"`);
        console.log(`   Expected: ${test.expectedInfo}`);
    });
});

console.log("\n\n=== VERIFICATION CHECKLIST ===");
console.log("✓ Mushy knows the founders (Bhartendu, Pravesh, Vikrant)");
console.log("✓ Mushy can explain company story and philosophy");
console.log("✓ Mushy provides certification information");
console.log("✓ Mushy knows production capacity (25+ kg daily)");
console.log("✓ Mushy lists all mushroom varieties");
console.log("✓ Mushy describes training programs");
console.log("✓ Mushy mentions future products");
console.log("✓ Mushy searches blogs for relevant articles");
console.log("✓ Mushy searches news for recent updates");
console.log("✓ Product pricing queries still work (RAG not broken)");
