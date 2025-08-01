
## 🚀 Deployment Commands

### 1. Hyperion Testnet (Metis) - Chain ID: 133717
```bash
source .env && rm -rf cache out && forge build && forge script --chain 133717 script/QuizGame.s.sol:QuizGameScript --rpc-url https://hyperion-testnet.metisdevops.link --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

### 2. Sepolia Testnet (Ethereum) - Chain ID: 11155111
```bash
source .env && rm -rf cache out && forge build && forge script --chain 11155111 script/QuizGame.s.sol:QuizGameScript --rpc-url https://eth-sepolia.public.blastapi.io --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

### 3. Polygon Mumbai Testnet - Chain ID: 80001
```bash
source .env && rm -rf cache out && forge build && forge script --chain 80001 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc-mumbai.maticvigil.com --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

### 4. Arbitrum Sepolia Testnet - Chain ID: 421614
```bash
source .env && rm -rf cache out && forge build && forge script --chain 421614 script/QuizGame.s.sol:QuizGameScript --rpc-url https://sepolia-rollup.arbitrum.io/rpc --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

### 5. Base Sepolia Testnet - Chain ID: 84532
```bash
source .env && rm -rf cache out && forge build && forge script --chain 84532 script/QuizGame.s.sol:QuizGameScript --rpc-url https://sepolia.base.org --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

### 6. Core DAO Testnet - Chain ID: 1114
```bash
source .env && rm -rf cache out && forge build && forge script --chain 1114 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc.test2.btcs.network --broadcast -vvvv --private-key ${PRIVATE_KEY}
```
