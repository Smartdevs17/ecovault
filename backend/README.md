# EcoVault Backend API

Node.js, Express, TypeScript, and MongoDB backend for the EcoVault sustainability platform.

## 🚀 Features

- RESTful API for managing sustainability projects
- Impact tracking and analytics
- User statistics and leaderboards
- Smart contract integration with ethers.js
- MongoDB with Mongoose for data persistence
- TypeScript for type safety
- Express.js with middleware (CORS, Helmet, Morgan)
- Input validation with express-validator

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

## ⚙️ Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecovault
CHAIN_ID=84532
NETWORK_NAME=baseSepolia
RPC_URL=https://sepolia.base.org
PROJECT_REGISTRY_ADDRESS=0x01fB5005481DA32adB5A289db24fd08CBA46B07F
IMPACT_NFT_ADDRESS=0x188B7587A753Ebd74fF0f5eF093933A041b52A96
ECO_VAULT_ADDRESS=0xe35Df24D4747b246Fe8C9dDCA28BbC33aDcC2Bc2
PRIVATE_KEY=your_backend_wallet_private_key_here
```

3. **Start MongoDB:**
```bash
# If using local MongoDB
mongod
```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `GET /api/projects/user/:address` - Get user's projects
- `GET /api/projects/:projectId/contribution/:userAddress` - Get user's contribution

### Impact Tracking

- `POST /api/impact` - Log new impact action
- `GET /api/impact/user/:address` - Get user's impact history
- `GET /api/impact` - Get all impacts

### Users

- `GET /api/users/:address` - Get user by wallet address
- `GET /api/users/:address/stats` - Get user statistics
- `GET /api/users/leaderboard/top` - Get leaderboard

### Health Check

- `GET /health` - Server health check

## 🗄️ Database Models

### Project
- Project information and funding details
- Links to on-chain project IDs

### Impact
- User impact actions (recycling, transport, etc.)
- Carbon reduction tracking
- Points system

### User
- User statistics and achievements
- Total impact points and contributions

## 🔧 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.ts    # Main config
│   │   ├── contracts.ts # Contract addresses
│   │   └── database.ts  # MongoDB connection
│   ├── controllers/     # Request handlers
│   │   ├── projects.ts
│   │   ├── impact.ts
│   │   └── users.ts
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   └── validate.ts
│   ├── models/          # Mongoose models
│   │   ├── Project.ts
│   │   ├── Impact.ts
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   ├── projects.ts
│   │   ├── impact.ts
│   │   └── users.ts
│   ├── services/        # Business logic
│   │   └── blockchain.ts
│   └── index.ts         # Entry point
├── .env                 # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🔗 Smart Contract Integration

The backend integrates with deployed smart contracts:
- **ProjectRegistry** - Project management
- **ImpactNFT** - NFT minting
- **EcoVault** - Funding and interactions

Contract addresses are loaded from environment variables.

## 🧪 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

## 📝 Environment Variables

See `.env.example` for all available environment variables.

## 🔒 Security

- Helmet.js for security headers
- CORS configured for frontend
- Input validation on all routes
- Error handling middleware
- Environment variables for sensitive data

## 📄 License

MIT

