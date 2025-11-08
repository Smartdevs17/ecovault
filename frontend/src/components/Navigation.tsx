import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Leaf, Menu, X, AlertCircle } from 'lucide-react'
import { useAccount, useDisconnect, useConnect, useChainId, useSwitchChain, useConnectorClient } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { addChain } from 'viem/actions'
import { useState } from 'react'
import { SUPPORTED_NETWORK, NETWORK_NAME } from '@/lib/web3-config'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
	{ path: '/', label: 'Home' },
	{ path: '/dashboard', label: 'Dashboard' },
	{ path: '/projects', label: 'Projects' },
	{ path: '/impact', label: 'Impact Tracking' },
	{ path: '/profile', label: 'Profile' },
]

export function Navigation() {
	const { address, isConnected } = useAccount()
	const chainId = useChainId()
	const { switchChain } = useSwitchChain()
	const { data: client } = useConnectorClient()
	const { disconnect } = useDisconnect()
	const { connect, connectors } = useConnect()
	const location = useLocation()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	
	const isWrongNetwork = isConnected && chainId !== SUPPORTED_NETWORK.BASE_SEPOLIA

	const handleSwitchToBaseSepolia = async () => {
		try {
			// Try to switch to Base Sepolia
			await switchChain({ chainId: SUPPORTED_NETWORK.BASE_SEPOLIA })
		} catch (err: any) {
			// If switch fails (chain not added), try to add it first
			if (err?.code === 4902 || err?.message?.includes('not added')) {
				try {
					// Add Base Sepolia to wallet using viem's addChain
					if (client) {
						await addChain(client, { chain: baseSepolia })
						// Then switch to it
						await switchChain({ chainId: SUPPORTED_NETWORK.BASE_SEPOLIA })
					} else {
						throw new Error('Wallet not connected')
					}
				} catch (addErr) {
					alert(`Please add Base Sepolia to your wallet manually:\n\nNetwork Name: Base Sepolia\nRPC URL: https://sepolia.base.org\nChain ID: 84532\nCurrency Symbol: ETH\nBlock Explorer: https://sepolia.basescan.org`)
				}
			}
		}
	}

	const formatAddress = (addr: string | undefined) => {
		if (!addr) return ''
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`
	}

	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
							<Leaf className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold">EcoVault</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-6">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className={`text-sm font-medium transition-colors hover:text-primary ${
									location.pathname === link.path
										? 'text-primary'
										: 'text-muted-foreground'
								}`}
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* Wallet Connection */}
					<div className="flex items-center gap-4">
						{/* Network Indicator */}
						{isConnected && (
							<>
								{isWrongNetwork ? (
									<Button
										variant="destructive"
										size="sm"
										className="gap-2"
										onClick={handleSwitchToBaseSepolia}
									>
										<AlertCircle className="h-4 w-4" />
										<span className="hidden sm:inline">Switch to {NETWORK_NAME}</span>
										<span className="sm:hidden">Wrong Network</span>
									</Button>
								) : (
									<Badge variant="outline" className="hidden sm:flex gap-1">
										<Leaf className="h-3 w-3" />
										{NETWORK_NAME}
									</Badge>
								)}
							</>
						)}
						{isConnected ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="gap-2">
										<Wallet className="h-4 w-4" />
										<span className="hidden sm:inline">
											{formatAddress(address)}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium">Connected Wallet</p>
											<p className="text-xs text-muted-foreground font-mono">
												{address}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => disconnect()}>
										Disconnect Wallet
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="gap-2">
										<Wallet className="h-4 w-4" />
										<span className="hidden sm:inline">Connect Wallet</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>Connect Wallet</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{connectors.map((connector) => (
										<DropdownMenuItem
											key={connector.uid}
											onClick={() => connect({ connector })}
											className="cursor-pointer"
										>
											{connector.name}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden py-4 space-y-2 border-t">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								onClick={() => setMobileMenuOpen(false)}
								className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									location.pathname === link.path
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-muted'
								}`}
							>
								{link.label}
							</Link>
						))}
					</div>
				)}
			</div>
		</nav>
	)
}

