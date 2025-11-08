# EcoVault Frontend

Frontend application for EcoVault - a Web3-powered platform for tracking sustainable community projects.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **wagmi** - Web3 React hooks
- **TanStack Query** - Data fetching and caching
- **React Router** - Routing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Web3 wallet (MetaMask recommended)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env` file in the `frontend` directory:

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

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   └── assets/         # Static assets
├── public/             # Public assets
└── package.json
```

## Features

- Web3 wallet connection (MetaMask, WalletConnect)
- Project creation and management
- Project funding with ETH
- Impact tracking and logging
- NFT display and management
- User profile and statistics
- Dashboard with analytics

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
