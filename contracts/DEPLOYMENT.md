
## 🚀 Deployment Commands

### Core Testnet2 - Chain ID: 1114
```bash
source .env && rm -rf cache out && forge build && forge script --chain 1114 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc.test2.btcs.network --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

## 🌐 Core Testnet2 Network Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Core Testnet2 |
| **Chain ID** | 1114 (0x45a) |
| **RPC Endpoint** | https://rpc.test2.btcs.network |
| **Archive Node RPC** | https://rpcar.test2.btcs.network |
| **WebSocket Endpoint** | wss://rpc.test2.btcs.network/wsp |
| **Currency Symbol** | tCORE |
| **Block Explorer URL** | https://scan.test2.btcs.network/ |
| **Faucet** | Available through Core DAO testnet faucet |

**Note**: This is the latest and officially supported testnet for the Core blockchain. The previous testnet (chain ID 1115) is now deprecated and no longer maintained.

## 📋 Contract Verification

### Core Testnet2 Verification

After deployment, verify your contracts on the Core Testnet2 block explorer:

```bash
# Verify QuizGame contract on Core Testnet2
forge verify-contract \
--chain-id 1114 \
--rpc-url https://rpc.test2.btcs.network \
--verifier-url 'https://scan.test2.btcs.network/api/' \
--verifier blockscout \
<CONTRACT_ADDRESS> \
src/QuizGame.sol:QuizGame

# Verify Token1 contract on Core Testnet2
forge verify-contract \
--chain-id 1114 \
--rpc-url https://rpc.test2.btcs.network \
--verifier-url 'https://scan.test2.btcs.network/api/' \
--verifier blockscout \
<TOKEN_CONTRACT_ADDRESS> \
src/QuizGame.sol:Token1
```

## 🔗 Useful Resources

### Core Blockchain Resources
- **Core DAO Documentation**: https://docs.coredao.org/
- **Core Testnet2 Block Explorer**: https://scan.test2.btcs.network/
- **Core DAO Testnet Faucet**: https://scan.test2.btcs.network/faucet
- **Core DAO Official Website**: https://coredao.org/
- **Core DAO GitHub**: https://github.com/coredao-org
