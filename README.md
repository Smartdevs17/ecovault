# 🌍 EcoVault

**EcoVault** is a Web3-powered platform designed to **incentivize and track sustainable community projects**. It empowers organizations and individuals to **fund, verify, and showcase environmental impact** — all transparently on-chain.

Built for the **Octant Hackathon**, EcoVault combines **React**, **TypeScript**, **Node.js (Express)**, **MongoDB**, and **smart contracts** to bring transparency and traceability to sustainability efforts.

---

## 🚀 Features

- 🔗 **Web3 Wallet Integration:** Connect via MetaMask or WalletConnect using `wagmi` and `ethers.js`
- 🌱 **Impact Project Registry:** Organizations can create and showcase sustainability projects
- 💰 **Fund Transparency:** Donors can contribute directly via smart contracts
- 📊 **Impact Tracking:** Projects are tracked via both on-chain data and off-chain analytics stored in MongoDB
- 🧾 **Verified Proof-of-Impact NFTs:** Contributors can mint NFTs as digital proof of their impact
- ⚡ **Decentralized + Centralized Blend:** Blockchain for transparency, Node.js backend for analytics and scalability
- ✅ **Project Verification:** Admin/verifier system for project validation
- 📈 **Real-time Analytics:** Dashboard with impact metrics, charts, and leaderboards

---

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
- Solidity (ERC721 for NFTs)
- Hardhat for development and deployment
- OpenZeppelin contracts for security
- Deployed on Base Sepolia Testnet

---

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
VITE_PROJECT_REGISTRY_ADDRESS=0x01fB5005481DA32adB5A289db24fd08CBA46B07F
VITE_IMPACT_NFT_ADDRESS=0x188B7587A753Ebd74fF0f5eF093933A041b52A96
VITE_ECO_VAULT_ADDRESS=0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2
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
PROJECT_REGISTRY_ADDRESS=0x01fB5005481DA32adB5A289db24fd08CBA46B07F
IMPACT_NFT_ADDRESS=0x188B7587A753Ebd74fF0f5eF093933A041b52A96
ECO_VAULT_ADDRESS=0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2
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
BASESCAN_API_KEY=your_basescan_api_key
```

Compile contracts:
```bash
npm run compile
```

Deploy to Base Sepolia:
```bash
npm run deploy:base
```

---

## 📋 Contract Addresses (Base Sepolia)

### ProjectRegistry
```
0x01fB5005481DA32adB5A289db24fd08CBA46B07F
```
**Explorer:** https://sepolia.basescan.org/address/0x01fB5005481DA32adB5A289db24fd08CBA46B07F

**Purpose:** Manages sustainability project registration and verification

### ImpactNFT
```
0x188B7587A753Ebd74fF0f5eF093933A041b52A96
```
**Explorer:** https://sepolia.basescan.org/address/0x188B7587A753Ebd74fF0f5eF093933A041b52A96

**Purpose:** ERC721 NFT contract for minting proof-of-impact tokens

### EcoVault
```
0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2
```
**Explorer:** https://sepolia.basescan.org/address/0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2

**Purpose:** Main contract handling funding, NFT minting, and project interactions

**Network:** Base Sepolia  
**Chain ID:** 84532  
**Block Explorer:** https://sepolia.basescan.org  
**Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

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

---

## 📝 API Sample Data

### Create Project

```json
{
  "name": "Community Tree Planting Initiative",
  "description": "Planting 10,000 trees across urban areas to combat climate change",
  "fundingGoal": "100000000000000000000",
  "owner": "0x575109e921C6d6a1Cb7cA60Be0191B10950AfA6C"
}
```

**Funding Goal:** 100 ETH (100,000,000,000,000,000,000 wei)

### Log Impact Action

```json
{
  "user": "0x575109e921C6d6a1Cb7cA60Be0191B10950AfA6C",
  "actionType": "recycling",
  "amount": "15 kg",
  "description": "Recycled plastic bottles, cardboard, and aluminum cans",
  "carbonReduced": 12.5,
  "waterSaved": 50
}
```

**Action Types:** `recycling`, `transport`, `water`, `energy`, `tree_planting`, `project_funding`, `other`

**Points Calculation:**
- Base points by action type (recycling: 10, transport: 8, water: 5, energy: 12, tree_planting: 25, project_funding: 50, other: 5)
- Bonus: +1 point per 10 kg of carbon reduced

---

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

### ImpactNFT
- `getUserNFTs(user)` - Get user's NFT token IDs
- `getImpactData(tokenId)` - Get NFT impact data
- `totalSupply()` - Get total NFT supply
- `ownerOf(tokenId)` - Get NFT owner
- `tokenURI(tokenId)` - Get NFT metadata URI

---

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

---

## 🧪 Testing

### Postman Collection

Import `backend/EcoVault_API.postman_collection.json` into Postman for API testing.

**Collection Variables:**
- `base_url` - API base URL (default: `http://localhost:5000`)
- `wallet_address` - Wallet address for testing
- `project_id` - Project ID (set after creating a project)

### Test Workflow

1. **Health Check:** Verify server is running
2. **Create Project:** Create a new project
3. **Verify Project:** Verify the project (verifier only)
4. **Fund Project:** Fund the project (min 0.001 ETH)
5. **Log Impact:** Log impact actions
6. **Get Stats:** Check user statistics and leaderboard

---

## 📊 Project Architecture

```
EcoVault Platform
├── Frontend (React + TypeScript)
│   ├── Pages: Dashboard, Projects, Impact Tracking, Profile
│   ├── Components: Project Cards, Impact Forms, NFT Display
│   └── Hooks: Web3 hooks, API hooks
├── Backend (Node.js + Express)
│   ├── API Routes: Projects, Impact, Users
│   ├── Controllers: Business logic
│   ├── Models: MongoDB schemas
│   └── Services: Blockchain interactions
└── Smart Contracts (Solidity)
    ├── ProjectRegistry: Project management
    ├── EcoVault: Funding and NFT minting
    └── ImpactNFT: NFT contract
```

---

## 🔒 Security Features

- **ReentrancyGuard:** Prevents reentrancy attacks
- **Ownable:** Access control for admin functions
- **Input Validation:** All inputs validated on frontend and backend
- **OpenZeppelin:** Uses battle-tested OpenZeppelin contracts
- **Environment Variables:** Sensitive data stored in `.env` files
- **Wallet Validation:** Ethereum address format validation

---

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
npm run deploy:base
```

Update contract addresses in frontend and backend `.env` files.

---

## 🧠 Future Improvements

- DAO governance for community-led project verification
- IPFS integration for project certificates and NFT metadata
- Advanced analytics dashboard for impact visualization
- Integration with carbon credit oracles
- Multi-chain support
- Mobile app (React Native)
- Social features (sharing, comments, ratings)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📚 Additional Resources

- **Base Sepolia Explorer:** https://sepolia.basescan.org
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Base Documentation:** https://docs.base.org
- **Hardhat Documentation:** https://hardhat.org
- **wagmi Documentation:** https://wagmi.sh
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

---

## 🧩 License

MIT License © 2025 **EcoVault Team**

---

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

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review contract addresses and network configuration
