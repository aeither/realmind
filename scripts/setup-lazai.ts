import { ChainConfig, Client } from "alith/lazai";

/**
 * LazAI Setup Script
 * 
 * This script helps you set up your LazAI environment:
 * - Register user on LazAI network
 * - Deposit inference fees
 * - Verify network connection
 * 
 * Prerequisites:
 * - Set PRIVATE_KEY environment variable
 * - Have testnet LAZAI tokens from faucet
 */

const LAZAI_IDAO_ADDRESS = "0xc3e98E8A9aACFc9ff7578C2F3BA48CA4477Ecf49";
const DEFAULT_DEPOSIT_AMOUNT = 10000000;

interface SetupConfig {
  depositAmount?: number;
  skipDeposit?: boolean;
}

async function checkWalletBalance(client: Client): Promise<void> {
  console.log("💰 Checking wallet balance...");
  
  try {
    // Note: Balance checking would need to be implemented with the Client
    console.log(`📍 Wallet Address: ${client.getWallet().address}`);
    console.log("ℹ️  Please ensure you have testnet LAZAI tokens from the faucet");
    console.log("🔗 Faucet: https://t.me/LazAITestnetFaucetBot");
  } catch (error) {
    console.error("❌ Error checking wallet:", error);
    throw error;
  }
}

async function registerUser(client: Client, depositAmount: number): Promise<void> {
  console.log("📝 Registering user on LazAI...");
  
  try {
    // Check if user already exists
    const existingUser = await client.getUser(client.getWallet().address);
    console.log("✅ User already registered:", existingUser);
    return;
  } catch (error) {
    // User doesn't exist, proceed with registration
    console.log("👤 User not found, creating new account...");
  }

  try {
    await client.addUser(depositAmount);
    console.log("✅ User registered successfully");
  } catch (error) {
    console.error("❌ Error registering user:", error);
    throw error;
  }
}

async function depositInferenceFees(client: Client, depositAmount: number): Promise<void> {
  console.log(`💳 Depositing ${depositAmount} tokens for inference fees...`);
  
  try {
    await client.depositInference(LAZAI_IDAO_ADDRESS, depositAmount);
    console.log("✅ Inference fees deposited successfully");
  } catch (error) {
    console.error("❌ Error depositing inference fees:", error);
    throw error;
  }
}

async function verifySetup(client: Client): Promise<void> {
  console.log("🔍 Verifying setup...");
  
  try {
    // Check user registration
    const user = await client.getUser(client.getWallet().address);
    console.log("✅ User verified:", user);

    // Check inference account
    try {
      const inferenceAccount = await client.getInferenceAccount(
        client.getWallet().address,
        LAZAI_IDAO_ADDRESS
      );
      console.log("✅ Inference account:", inferenceAccount);
    } catch (error) {
      console.log("⚠️  Inference account not found (this is normal for new users)");
    }

    // Test network connectivity
    try {
      const nodeInfo = await client.getInferenceNode(LAZAI_IDAO_ADDRESS);
      console.log("✅ Network connectivity verified");
      console.log(`🌐 Inference node URL: ${nodeInfo.url}`);
    } catch (error) {
      console.error("❌ Network connectivity issue:", error);
    }

  } catch (error) {
    console.error("❌ Setup verification failed:", error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    console.log("🚀 Starting LazAI Setup...");
    console.log();

    // Validate environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is required");
    }

    // Parse command line arguments
    const config: SetupConfig = {};
    
    const depositArg = process.argv.find(arg => arg.startsWith('--deposit='));
    if (depositArg) {
      config.depositAmount = parseInt(depositArg.split('=')[1], 10);
      if (isNaN(config.depositAmount)) {
        throw new Error("Invalid deposit amount");
      }
    }

    if (process.argv.includes('--skip-deposit')) {
      config.skipDeposit = true;
    }

    const depositAmount = config.depositAmount || DEFAULT_DEPOSIT_AMOUNT;

    console.log("⚙️  Setup Configuration:");
    console.log(`   Deposit Amount: ${depositAmount}`);
    console.log(`   Skip Deposit: ${config.skipDeposit || false}`);
    console.log();

    // Initialize LazAI client
    console.log("🔌 Connecting to LazAI network...");
    const client = new Client(ChainConfig.testnet());
    
    console.log("✅ Connected to LazAI testnet");
    console.log(`📊 Chain ID: ${ChainConfig.testnet().chainId}`);
    console.log(`🔗 RPC: ${ChainConfig.testnet().rpcUrl}`);
    console.log();

    // Check wallet
    await checkWalletBalance(client);
    console.log();

    // Register user
    await registerUser(client, depositAmount);
    console.log();

    // Deposit inference fees (unless skipped)
    if (!config.skipDeposit) {
      await depositInferenceFees(client, depositAmount);
      console.log();
    }

    // Verify setup
    await verifySetup(client);
    console.log();

    console.log("🎉 LazAI setup completed successfully!");
    console.log();
    console.log("📋 Next Steps:");
    console.log("1. Run data contribution: npx tsx scripts/data-contribution.ts");
    console.log("2. Run inference queries: npx tsx scripts/inference-query.ts [fileId] [query]");
    console.log();
    console.log("💡 Useful Commands:");
    console.log("   Check setup: npx tsx scripts/setup-lazai.ts --skip-deposit");
    console.log("   Add more deposit: npx tsx scripts/setup-lazai.ts --deposit=5000000");

  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.log();
    console.log("🔧 Troubleshooting:");
    console.log("1. Ensure PRIVATE_KEY environment variable is set");
    console.log("2. Get testnet tokens from: https://t.me/LazAITestnetFaucetBot");
    console.log("3. Check network connectivity");
    console.log("4. Verify wallet has sufficient balance");
    
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main();
}