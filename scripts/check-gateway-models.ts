import { createGateway } from "ai";
import "dotenv/config";

async function main() {
    const gateway = createGateway({
        apiKey: process.env.AI_GATEWAY_API_KEY,
    });

    try {
        const models = await gateway.getAvailableModels();
        console.log("Available Models:", JSON.stringify(models, null, 2));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

main();
