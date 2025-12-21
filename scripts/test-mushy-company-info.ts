/**
 * Manual Test Script for Mushy AI Chatbot
 * 
 * This script helps verify that Mushy can now answer company information questions.
 * 
 * HOW TO TEST:
 * 1. Make sure the dev server is running: npm run dev
 * 2. Open http://localhost:3000 in your browser
 * 3. Click on the Mushy chatbot widget
 * 4. Try the test queries below and verify the responses
 */

// TEST QUERIES TO TRY:

const testQueries = [
    // Location Tests
    {
        query: "Where is MushMush located?",
        expectedInfo: "Herbetpur, Dehradun, Uttarakhand, India"
    },
    {
        query: "Where are you located?",
        expectedInfo: "Herbetpur, Dehradun, Uttarakhand, India"
    },

    // Contact Tests
    {
        query: "How can I contact you?",
        expectedInfo: "mushagroprod@gmail.com and +91-7618362662"
    },
    {
        query: "What is your email?",
        expectedInfo: "mushagroprod@gmail.com"
    },
    {
        query: "What is your phone number?",
        expectedInfo: "+91-7618362662"
    },

    // Business Hours Tests
    {
        query: "What are your business hours?",
        expectedInfo: "Monday-Saturday: 9:00 AM - 6:00 PM, Sunday: 9:00 AM - 3:00 PM"
    },
    {
        query: "When are you open?",
        expectedInfo: "Monday-Saturday: 9:00 AM - 6:00 PM, Sunday: 9:00 AM - 3:00 PM"
    },

    // Combined Tests
    {
        query: "Where are you located and how can I reach you?",
        expectedInfo: "Location + Email + Phone"
    },

    // Product Tests (to verify RAG still works)
    {
        query: "turkey tail mushroom price?",
        expectedInfo: "₹899 for 100gm"
    },
    {
        query: "dried turkey tail mushroom price?",
        expectedInfo: "₹899 for 100gm"
    }
];

console.log("=== MUSHY AI CHATBOT TEST QUERIES ===\n");
console.log("Test each query and verify Mushy provides the expected information:\n");

testQueries.forEach((test, index) => {
    console.log(`${index + 1}. Query: "${test.query}"`);
    console.log(`   Expected: ${test.expectedInfo}`);
    console.log("");
});

console.log("\n=== VERIFICATION CHECKLIST ===");
console.log("✓ Mushy provides accurate location information");
console.log("✓ Mushy provides correct email and phone");
console.log("✓ Mushy provides correct business hours");
console.log("✓ Mushy can handle combined queries");
console.log("✓ Product pricing queries still work (RAG not broken)");
