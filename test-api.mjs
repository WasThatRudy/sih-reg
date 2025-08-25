#!/usr/bin/env node

/**
 * Simple test script to verify SIH Backend API endpoints
 * Usage: node test-api.mjs
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const testEndpoints = [
  {
    name: "Get Problem Statements",
    method: "GET",
    url: `${BASE_URL}/api/problem-statements`,
    expectedStatus: 200,
  },
  {
    name: "Health Check",
    method: "GET",
    url: `${BASE_URL}/api/teamRegistration`,
    expectedStatus: 405, // Method Not Allowed for GET
  },
];

async function testAPI() {
  console.log("🚀 Starting SIH Backend API Tests...\n");

  for (const test of testEndpoints) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);

      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const success = response.status === test.expectedStatus;
      const status = success ? "✅" : "❌";

      console.log(
        `${status} Status: ${response.status} (expected: ${test.expectedStatus})`
      );

      if (!success) {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log("---");
  }

  console.log("\n✨ API Tests completed!");
  console.log("\n📚 For full API documentation, see README-Backend.md");
  console.log(
    "🌐 To test all endpoints, start the development server with: npm run dev"
  );
}

// Check if we're running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
}

export { testAPI };
