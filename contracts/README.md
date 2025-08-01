## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy with CREATE2 (Predictable Addresses)

The deployment script uses CREATE2 to deploy contracts to the same deterministic address across all blockchains.

#### Deploy to Multiple Blockchains

```shell
# Hyperion Testnet (Metis)
source .env && rm -rf cache out && forge build && forge script --chain 133717 script/QuizGame.s.sol:QuizGameScript --rpc-url https://hyperion-testnet.metisdevops.link --broadcast -vvvv --private-key ${PRIVATE_KEY}

# Sepolia Testnet (Ethereum)
source .env && rm -rf cache out && forge build && forge script --chain 11155111 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc.sepolia.org --broadcast -vvvv --private-key ${PRIVATE_KEY}

# Polygon Mumbai Testnet
source .env && rm -rf cache out && forge build && forge script --chain 80001 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc-mumbai.maticvigil.com --broadcast -vvvv --private-key ${PRIVATE_KEY}

# Arbitrum Sepolia Testnet
source .env && rm -rf cache out && forge build && forge script --chain 421614 script/QuizGame.s.sol:QuizGameScript --rpc-url https://sepolia-rollup.arbitrum.io/rpc --broadcast -vvvv --private-key ${PRIVATE_KEY}

# Base Sepolia Testnet
source .env && rm -rf cache out && forge build && forge script --chain 84532 script/QuizGame.s.sol:QuizGameScript --rpc-url https://sepolia.base.org --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

#### Predict Addresses (Without Deploying)

You can predict the contract addresses before deployment:

```shell
# Predict addresses for any chain
forge script script/QuizGame.s.sol:QuizGameScript --sig "predictAddresses()" --rpc-url https://hyperion-testnet.metisdevops.link
```

#### Legacy Deployment (Old Method)

```shell
# Hyperion Testnet
source .env && rm -rf cache out && forge build && forge script --chain 133717 script/QuizGame.s.sol:QuizGameScript --rpc-url https://hyperion-testnet.metisdevops.link --broadcast -vvvv --private-key ${PRIVATE_KEY}

# Sepolia Testnet
source .env && rm -rf cache out && forge build && forge script --chain 11155111 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc.sepolia.org --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

### Verify

```shell
# Hyperion Testnet
forge verify-contract \
  --rpc-url https://hyperion-testnet.metisdevops.link \
  --verifier blockscout \
  --verifier-url 'https://hyperion-testnet-explorer-api.metisdevops.link/api/' \
  0x7d063d7735861EB49b092A7430efa1ae3Ac4F6F5 \
  script/QuizGame.s.sol:QuizGameScript

# Sepolia Testnet
forge verify-contract \
  --rpc-url https://rpc.sepolia.org \
  --verifier etherscan \
  --etherscan-api-key ${ETHERSCAN_API_KEY} \
  0x7d063d7735861EB49b092A7430efa1ae3Ac4F6F5 \
  script/QuizGame.s.sol:QuizGameScript
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
