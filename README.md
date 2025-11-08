# 🌍 EcoVault

**EcoVault** is a Web3-powered platform designed to incentivize and track sustainable community projects. It empowers organizations and individuals to fund, verify, and showcase environmental impact — all transparently on-chain.

## 🚀 Features

- **Web3 Wallet Integration:** Connect via MetaMask or WalletConnect using `wagmi` and `viem`
- **Impact Project Registry:** Organizations can create and showcase sustainability projects
- **Transparent Funding:** Donors can contribute directly via smart contracts with full on-chain transparency
- **Impact Tracking:** Projects are tracked via both on-chain data and off-chain analytics stored in MongoDB
- **Verified Proof-of-Impact NFTs:** Contributors can mint NFTs as digital proof of their impact
- **Yield Donation Strategy:** All contributions are deposited into a treasury vault that generates yield through DeFi protocols (Kalani/Yearn v3 and Aave v3), with yield automatically routed to verified projects via Octant V2
- **Project Verification:** Admin/verifier system for project validation
- **Real-time Analytics:** Dashboard with impact metrics, charts, and leaderboards
- **Yield Metrics Dashboard:** Track total deposits, available yield, and yield distribution in real-time

## 🏗️ Tech Stack

### Frontend
- React 18 (TypeScript)
- Vite
- TailwindCSS
- wagmi + viem for Web3 interactions
- TanStack Query (React Query) for data fetching
- Shadcn UI components

### Backend
- Node.js + Express (TypeScript)
- MongoDB (Mongoose)
- Smart contract interaction via `ethers.js`
- REST API endpoints for managing project data and analytics

### Smart Contracts
- Solidity 0.8.20
- Hardhat for development and deployment
- OpenZeppelin contracts for security
- ERC-4626 compliant vaults for yield generation
- Deployed on Base Sepolia Testnet

### DeFi Integrations
- **Octant V2:** Automated yield allocation to verified projects
- **Kalani (Yearn v3):** ERC-4626 vault integration for yield generation
- **Aave v3:** ERC-4626 ATokenVault integration for alternative yield sources

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- MetaMask or compatible Web3 wallet
- Testnet ETH on Base Sepolia

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Smartdevs17/ecovault.git
cd ecovault
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_PROJECT_REGISTRY_ADDRESS=0x2637DaA81d7bDa9be540D9337642feB313Bc734c
VITE_IMPACT_NFT_ADDRESS=0x92bfb1fe59eCd73920a3a2c29f61bDD7b43F2519
VITE_ECO_VAULT_ADDRESS=0xAFdF5236B7564E885F835C9bb3FfA97Ae27bEb6A
VITE_TREASURY_VAULT_ADDRESS=0xE604Dbf839c5f69116CFB5303E5f0f604F8562ad
VITE_OCTANT_YIELD_ROUTER_ADDRESS=0xa94079b654C070EBb1734daF9BAEd81293a97f8F
VITE_CHAIN_ID=84532
VITE_NETWORK_NAME=baseSepolia
VITE_RPC_URL=https://sepolia.base.org
VITE_BLOCK_EXPLORER_URL=https://sepolia.basescan.org
```

Start development server:
```bash
npm run dev
```

Access the app at `http://localhost:5173`

### 3️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecovault
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://sepolia.base.org
PROJECT_REGISTRY_ADDRESS=0x2637DaA81d7bDa9be540D9337642feB313Bc734c
IMPACT_NFT_ADDRESS=0x92bfb1fe59eCd73920a3a2c29f61bDD7b43F2519
ECO_VAULT_ADDRESS=0xAFdF5236B7564E885F835C9bb3FfA97Ae27bEb6A
TREASURY_VAULT_ADDRESS=0xE604Dbf839c5f69116CFB5303E5f0f604F8562ad
OCTANT_YIELD_ROUTER_ADDRESS=0xa94079b654C070EBb1734daF9BAEd81293a97f8F
CHAIN_ID=84532
NETWORK_NAME=baseSepolia
```

Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 4️⃣ Smart Contracts Setup

```bash
cd contracts
npm install
```

Create `.env` file:
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Compile contracts:
```bash
npm run compile
```

Deploy to Base Sepolia:
```bash
npm run deploy:testnet
```

## 📋 Contract Addresses (Base Sepolia)

### Core Contracts
- **ProjectRegistry:** `0x2637DaA81d7bDa9be540D9337642feB313Bc734c`
- **ImpactNFT:** `0x92bfb1fe59eCd73920a3a2c29f61bDD7b43F2519`
- **EcoVault:** `0xAFdF5236B7564E885F835C9bb3FfA97Ae27bEb6A`

### Yield System Contracts
- **TreasuryVault:** `0xE604Dbf839c5f69116CFB5303E5f0f604F8562ad`
- **OctantYieldRouter:** `0xa94079b654C070EBb1734daF9BAEd81293a97f8F`
- **SimpleERC4626Vault:** `0xbB3cEb5A63b2e4B801F376119735519ed014D22A` (testnet)
- **SimpleOctantV2Allocator:** `0x77a7E580d1Bd2A81862C996e5B6F2dc3Ac1578dD` (testnet)

**Network:** Base Sepolia  
**Chain ID:** 84532  
**Block Explorer:** https://sepolia.basescan.org  
**Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🌐 API Routes

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | Get all projects (query: `verified`, `active`) |
| `GET` | `/api/projects/:id` | Get project by ID |
| `POST` | `/api/projects` | Create a new project |
| `PATCH` | `/api/projects/:id` | Update project |
| `POST` | `/api/projects/:id/verify` | Verify a project (verifier only) |
| `GET` | `/api/projects/user/:address` | Get user's projects |

### Impact Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/impact` | Log new impact action |
| `GET` | `/api/impact/user/:address` | Get user's impact history and stats |
| `GET` | `/api/impact` | Get all impacts (query: `actionType`, `limit`, `skip`) |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/:address` | Get user data |
| `GET` | `/api/users/:address/stats` | Get user statistics |
| `GET` | `/api/users/leaderboard/top` | Get leaderboard (query: `limit`) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

## 🪙 Smart Contract Features

### ProjectRegistry
- `createProject(name, description, fundingGoal)` - Create new project
- `getProject(id)` - Get project details
- `getUserProjects(address)` - Get user's projects
- `verifyProject(id)` - Verify project (verifier only)
- `projectCount()` - Get total project count

### EcoVault
- `fundProject(projectId)` - Fund a project (payable, min 0.001 ETH)
- `getUserContribution(user, projectId)` - Get user's contribution
- `getProjectTotalContributions(projectId)` - Get total contributions
- `getProjectFundings(projectId)` - Get all funding records
- `MIN_FUNDING_AMOUNT` - Minimum funding constant (0.001 ETH)
- `NFT_MINT_THRESHOLD` - NFT minting threshold (0.01 ETH)

### TreasuryVault
- `depositForProject(projectId)` - Deposit funds for a project (authorized depositors only)
- `withdrawPrincipal(projectId, amount)` - Withdraw principal from a project
- `harvestYield()` - Harvest yield from yield sources
- `availableYield()` - Get available yield for distribution
- `totalDeposits()` - Get total deposits in treasury
- `projectDeposits(projectId)` - Get project-specific deposits

### OctantYieldRouter
- `distributeYieldToVerifiedProjects()` - Distribute yield to verified projects via Octant V2
- `setProjectImpactScore(projectId, score)` - Set impact score for a project
- `batchSetImpactScores(projectIds, scores)` - Batch set impact scores
- `projectImpactScore(projectId)` - Get impact score for a project

### ImpactNFT
- `getUserNFTs(user)` - Get user's NFT token IDs
- `getImpactData(tokenId)` - Get NFT impact data
- `totalSupply()` - Get total NFT supply
- `ownerOf(tokenId)` - Get NFT owner
- `tokenURI(tokenId)` - Get NFT metadata URI

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create database user with read/write permissions
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string and add to backend `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecovault?retryWrites=true&w=majority
```

### Local MongoDB

```env
MONGO_URI=mongodb://localhost:27017/ecovault
```

## 📊 Project Architecture

```
EcoVault Platform
├── Frontend (React + TypeScript)
│   ├── Pages: Dashboard, Projects, Impact Tracking, Profile
│   ├── Components: Project Cards, Impact Forms, NFT Display, Yield Metrics
│   └── Hooks: Web3 hooks, API hooks
├── Backend (Node.js + Express)
│   ├── API Routes: Projects, Impact, Users
│   ├── Controllers: Business logic
│   ├── Models: MongoDB schemas
│   └── Services: Blockchain interactions
└── Smart Contracts (Solidity)
    ├── ProjectRegistry: Project management
    ├── EcoVault: Funding and NFT minting
    ├── ImpactNFT: NFT contract
    ├── TreasuryVault: Yield-generating vault
    └── OctantYieldRouter: Yield distribution via Octant V2
```

## 💰 Yield Donation Strategy

EcoVault implements an automated yield donation strategy:

1. **Contribution Phase:** Users fund verified sustainability projects through EcoVault. Contributions are deposited into TreasuryVault (ERC-4626 compliant).

2. **Yield Generation:** Treasury deposits funds into Kalani (Yearn v3) or Aave v3 vaults. Yield accumulates continuously from DeFi protocols.

3. **Yield Distribution:** Harvested yield is routed through Octant V2 allocation contracts. Yield is distributed to verified projects based on:
   - **Impact Score** - Higher impact projects receive more yield
   - **Verification Status** - Only verified projects receive yield
   - **Active Status** - Only active projects are eligible

4. **Transparency:** All yield generation and distribution is on-chain. Users can track yield generated from their contributions, and projects can see yield donations received.

## 🔒 Security Features

- **ReentrancyGuard:** Prevents reentrancy attacks
- **Ownable:** Access control for admin functions
- **Input Validation:** All inputs validated on frontend and backend
- **OpenZeppelin:** Uses battle-tested OpenZeppelin contracts
- **Environment Variables:** Sensitive data stored in `.env` files
- **Wallet Validation:** Ethereum address format validation
- **Authorized Depositors:** Only authorized addresses can deposit to treasury
- **Yield Distributor Authorization:** Only authorized routers can distribute yield

## 🚀 Deployment

### Frontend

```bash
cd frontend
npm run build
```

Deploy `dist/` folder to your hosting service (Vercel, Netlify, etc.)

### Backend

```bash
cd backend
npm run build
npm start
```

Deploy to your server or cloud platform (Heroku, Railway, etc.)

### Smart Contracts

```bash
cd contracts
npm run deploy:testnet
```

Update contract addresses in frontend and backend `.env` files.

## 🧠 Future Improvements

- DAO governance for community-led project verification
- IPFS integration for project certificates and NFT metadata
- Advanced analytics dashboard for impact visualization
- Integration with carbon credit oracles
- Multi-chain support
- Mobile app (React Native)
- Social features (sharing, comments, ratings)
- Mainnet deployment with real DeFi protocol integrations

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 Additional Resources

- **Base Sepolia Explorer:** https://sepolia.basescan.org
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Base Documentation:** https://docs.base.org
- **Hardhat Documentation:** https://hardhat.org
- **wagmi Documentation:** https://wagmi.sh
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Octant V2 Documentation:** https://docs.v2.octant.build

## 🧩 License

MIT License © 2025 **EcoVault Team**

## 🆘 Troubleshooting

### Frontend Issues

**"Connection refused"**
- Ensure backend server is running
- Check `VITE_API_URL` in `.env`

**"Invalid network"**
- Switch to Base Sepolia in MetaMask
- Check `VITE_CHAIN_ID` matches network

### Backend Issues

**"MongoDB connection failed"**
- Check `MONGO_URI` in `.env`
- Verify MongoDB is running (local) or cluster is active (Atlas)
- Check IP whitelist (Atlas)

**"Invalid private key"**
- Ensure private key doesn't have `0x` prefix
- Verify key is 64 hex characters

### Smart Contract Issues

**"Insufficient funds"**
- Get testnet ETH from faucet
- Check wallet balance on block explorer

**"Project not found"**
- Projects start at ID 1, not 0
- Verify project exists on-chain

**"Project must be verified"**
- Projects must be verified before funding
- Check verifier permissions

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review contract addresses and network configuration
