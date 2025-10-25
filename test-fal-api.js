/**
 * Quick test script to check Fal.ai FLUX API response format
 * Run: node test-fal-api.js
 */

const fal = require("@fal-ai/serverless-client");
require("dotenv").config({ path: ".env.local" });

// Configure Fal.ai
if (process.env.FAL_API_KEY) {
  fal.config({
    credentials: process.env.FAL_API_KEY,
  });
} else {
  console.error("❌ FAL_API_KEY not found in .env.local");
  process.exit(1);
}

async function testFluxAPI() {
  try {
    console.log("🚀 Testing Fal.ai FLUX Dev API...\n");

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: "A golden retriever running on a beach",
        image_size: "landscape_16_9",
        num_images: 1,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log(`⏳ Queue Status: ${update.status}`);
      },
    });

    console.log("\n✅ Full API Response:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n📦 result.data structure:");
    console.log("  - Type:", typeof result.data);
    console.log("  - Keys:", Object.keys(result.data || {}));
    console.log("  - Has 'images'?", !!result.data.images);
    console.log("  - Has 'image'?", !!result.data.image);

    if (result.data.images && result.data.images.length > 0) {
      console.log("\n🖼️ Image URL:", result.data.images[0].url);
    } else if (result.data.image) {
      console.log("\n🖼️ Image URL:", result.data.image.url || result.data.image);
    } else {
      console.log("\n❌ No image found in response");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Full error:", error);
  }
}

testFluxAPI();
