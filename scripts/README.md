# LazAI TypeScript Integration

Complete TypeScript setup for LazAI privacy-preserving AI infrastructure. Contribute private data, earn rewards, and run AI inference while maintaining full data control.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd scripts
npm install alith@latest
```

### 2. Environment Setup

Create a `.env` file in the `scripts/` directory:

```bash
# Required: Your wallet private key
PRIVATE_KEY=your_wallet_private_key_here

# Optional: For data contribution (Pinata IPFS)
IPFS_JWT=your_pinata_jwt_here
```

### 3. Get Testnet Tokens

Visit the [LazAI Testnet Faucet](https://t.me/LazAITestnetFaucetBot) to get testnet LAZAI tokens.

## 📋 Available Scripts

### Setup & Registration

```bash
# Initial setup - register user and deposit inference fees
npx tsx scripts/setup-lazai.ts

# Test connection without depositing
npx tsx scripts/setup-lazai.ts --skip-deposit

# Custom deposit amount
npx tsx scripts/setup-lazai.ts --deposit=5000000
```

### Data Contribution

```bash
# Contribute privacy data and earn DAT rewards
npx tsx scripts/data-contribution.ts
```

**Note**: Save the File ID returned by this script - you'll need it for inference queries.

### AI Inference

```bash
# Basic inference query (uses default File ID 10)
npx tsx scripts/inference-query.ts

# Query with specific File ID
npx tsx scripts/inference-query.ts 15

# Query with custom File ID and question
npx tsx scripts/inference-query.ts 15 "What is machine learning?"
```

## 🔧 Network Information

- **Chain ID**: 133718
- **Currency**: LAZAI
- **RPC**: https://testnet.lazai.network
- **Explorer**: https://testnet-explorer.lazai.network
- **Faucet**: [Telegram Bot](https://t.me/LazAITestnetFaucetBot)

## 📖 Workflow Overview

### 1. Setup (One-time)
```bash
npx tsx scripts/setup-lazai.ts
```
- Registers your wallet on LazAI
- Deposits inference fees
- Verifies network connectivity

### 2. Data Contribution
```bash
npx tsx scripts/data-contribution.ts
```
- Encrypts your privacy data
- Uploads to decentralized storage
- Registers with LazAI smart contract
- Earns DAT (Data Anchor Token) rewards
- Returns a File ID for future inference

### 3. AI Inference
```bash
npx tsx scripts/inference-query.ts [fileId] [query]
```
- Uses your contributed data for AI inference
- Maintains privacy through cryptographic settlement
- Supports various AI models

## 🔐 Security Features

- **Privacy-Preserving**: Your data never leaves your control
- **Cryptographic Settlement**: Secure access verification
- **Decentralized Storage**: Data stored on IPFS/decentralized networks
- **Smart Contract Verification**: On-chain proof validation

## 🛠 Development

### Project Structure
```
scripts/
├── tsconfig.json           # TypeScript configuration
├── package.json           # Dependencies and scripts
├── setup-lazai.ts         # User registration and setup
├── data-contribution.ts   # Privacy data contribution
├── inference-query.ts     # AI inference queries
└── README.md             # This guide
```

### Advanced Usage

#### Custom Model Selection
```typescript
// In inference-query.ts, modify the config:
const config = {
  fileId: 15,
  model: "gpt-4", // or other supported models
  query: "Your question here"
};
```

#### Multiple File IDs
You can contribute multiple datasets and use different File IDs for different types of queries.

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot find module 'alith'"**
   ```bash
   cd scripts && npm install alith@latest
   ```

2. **"PRIVATE_KEY environment variable is required"**
   - Create `.env` file with your wallet private key
   - Never commit your private key to version control

3. **"Insufficient balance"**
   - Get testnet tokens from the faucet
   - Wait for faucet transaction to confirm

4. **"User not found"**
   - Run setup script first: `npx tsx scripts/setup-lazai.ts`

5. **"Network connectivity issue"**
   - Check internet connection
   - Verify RPC endpoint is accessible

### Debug Mode
Add console logging for debugging:
```typescript
console.log("Debug:", await client.getUser(client.getWallet().address));
```

## 📚 Additional Resources

- [LazAI Documentation](https://docs.lazai.network)
- [Alith SDK](https://github.com/0xLazAI/alith)
- [LazAI Explorer](https://testnet-explorer.lazai.network)

## 🤝 Support

For issues and questions:
- GitHub Issues: Create an issue in your repository
- LazAI Community: Join the official channels
- Documentation: Check the official LazAI docs

---

**⚠️ Important**: This is testnet software. Never use mainnet private keys or real assets.