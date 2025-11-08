# EcoVault Smart Contracts

Smart contracts for the EcoVault sustainability platform, built with Hardhat and Solidity.

## 📁 Contract Structure

- **ProjectRegistry.sol** - Manages sustainability project registration and verification
- **ImpactNFT.sol** - ERC721 NFT contract for minting proof-of-impact tokens
- **EcoVault.sol** - Main contract handling funding, NFT minting, and project interactions

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy to Local Network

1. Start a local Hardhat node:
```bash
npm run node
```

2. In another terminal, deploy:
```bash
npm run deploy:local
```

### Deploy to Sepolia Testnet

1. Create a `.env` file with your private key and RPC URLs:
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Deploy:
```bash
npm run deploy:sepolia
```

## 📋 Contract Features

### ProjectRegistry
- Create and manage sustainability projects
- Project verification system
- Funding goal tracking
- Project status management

### ImpactNFT
- ERC721 compliant NFTs
- Mint proof-of-impact tokens
- Store impact data on-chain
- Track user contributions

### EcoVault
- Fund verified projects
- Automatic NFT minting for contributions above threshold
- Contribution tracking
- Secure fund transfers

## 🔧 Configuration

Edit `hardhat.config.ts` to configure networks, compiler settings, and verification.

## 📝 Scripts

- `npm run compile` - Compile contracts
- `npm run test` - Run tests
- `npm run deploy:local` - Deploy to local network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run deploy:base` - Deploy to Base mainnet
- `npm run node` - Start local Hardhat node
- `npm run clean` - Clean artifacts and cache

## 🔒 Security

- Uses OpenZeppelin contracts for security
- ReentrancyGuard protection
- Access control with Ownable
- Input validation on all functions

## 📄 License

MIT

