import { ChainConfig, Client } from "alith/lazai";
import { Agent } from "alith";
import dotenv from "dotenv";

dotenv.config();

/**
 * LazAI Inference Query Script
 * 
 * This script demonstrates how to make privacy-preserving AI inference
 * queries using your contributed data on LazAI.
 * 
 * Prerequisites:
 * - Set PRIVATE_KEY environment variable
 * - Have completed data contribution and obtained a File ID
 * - Have deposited inference fees
 */

// LazAI iDAO address for inference node
const LAZAI_IDAO_ADDRESS = "0xc3e98E8A9aACFc9ff7578C2F3BA48CA4477Ecf49";
const DEPOSIT_AMOUNT = 10000000;

interface InferenceConfig {
  fileId: number;
  model?: string;
  query: string;
}

async function setupUser(client: Client): Promise<void> {
  console.log("👤 Setting up user account...");
  
  try {
    const address = await client.getUser(client.getWallet().address);
    console.log("✅ User already exists:", address);
  } catch (error) {
    console.log("📝 User does not exist, registering...");
    try {
      await client.addUser(DEPOSIT_AMOUNT);
      await client.depositInference(LAZAI_IDAO_ADDRESS, DEPOSIT_AMOUNT);
      console.log(`✅ Successfully registered user and deposited ${DEPOSIT_AMOUNT}`);
    } catch (setupError) {
      console.error("❌ Error setting up user:", setupError);
      throw setupError;
    }
  }
}

async function checkInferenceAccount(client: Client): Promise<void> {
  console.log("🔍 Checking inference account...");
  
  try {
    const account = await client.getInferenceAccount(
      client.getWallet().address, 
      LAZAI_IDAO_ADDRESS
    );
    
    console.log("💰 Inference account:", account);
    
    if (!account || account !== client.getWallet().address) {
      console.log("⚠️  Warning: User account not found with inference node.");
      console.log("   This may cause authentication errors.");
    } else {
      console.log("✅ Inference account verified");
    }
  } catch (error) {
    console.error("❌ Error checking inference account:", error);
  }
}

async function performInference(config: InferenceConfig): Promise<string> {
  try {
    console.log("🚀 Starting LazAI Privacy-Preserving Inference...");

    // Validate environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is required");
    }

    // Initialize LazAI client
    const client = new Client(ChainConfig.testnet());
    console.log(`📍 Wallet Address: ${client.getWallet().address}`);

    // Setup user if needed
    await setupUser(client);

    // Check inference account
    await checkInferenceAccount(client);

    // Get inference node information
    console.log("🌐 Getting inference node information...");
    const nodeInfo = await client.getInferenceNode(LAZAI_IDAO_ADDRESS);
    const inferenceUrl = nodeInfo.url;
    
    console.log("🔗 Inference URL:", inferenceUrl);

    // Create AI agent with settlement headers
    console.log("🤖 Initializing AI agent...");
    const agent = new Agent({
      model: config.model || "deepseek/deepseek-r1-0528",
      baseUrl: `${inferenceUrl}/v1`,
      // Settlement headers for privacy-preserving access
      extraHeaders: await client.getRequestHeaders(LAZAI_IDAO_ADDRESS, config.fileId),
    });

    console.log(`💭 Query: "${config.query}"`);
    console.log("🔄 Processing inference request...");

    // Perform the inference
    const response = await agent.prompt(config.query);
    
    console.log("✅ Inference completed successfully!");
    console.log("📄 Response:");
    console.log("-".repeat(50));
    console.log(response);
    console.log("-".repeat(50));

    return response;

  } catch (error) {
    console.error("❌ Error performing inference:", error);
    throw error;
  }
}

async function main() {
  try {
    // Configuration - modify these values as needed
    const config: InferenceConfig = {
      fileId: 10, // Replace with your actual File ID from data contribution
      model: "deepseek/deepseek-r1-0528", // Optional: specify different model
      query: "What is Alith?" // Your inference query
    };

    // Read File ID from command line argument if provided
    const fileIdArg = process.argv[2];
    if (fileIdArg) {
      config.fileId = parseInt(fileIdArg, 10);
      if (isNaN(config.fileId)) {
        throw new Error("Invalid File ID provided");
      }
    }

    // Read query from command line argument if provided
    const queryArg = process.argv[3];
    if (queryArg) {
      config.query = queryArg;
    }

    console.log("🎯 Inference Configuration:");
    console.log(`   File ID: ${config.fileId}`);
    console.log(`   Model: ${config.model}`);
    console.log(`   Query: "${config.query}"`);
    console.log();

    await performInference(config);

    console.log("🎉 Inference process completed successfully!");

  } catch (error) {
    console.error("❌ Error in main process:", error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main();
}