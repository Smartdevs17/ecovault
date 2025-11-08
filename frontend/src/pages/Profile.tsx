import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAccount } from 'wagmi'
import { Wallet, Award, Trophy, Star, Leaf, Settings, Image as ImageIcon } from 'lucide-react'
import { useUser, useUserStats } from '@/hooks/useUsers'
import { useUserNFTs } from '@/hooks/useImpactNFT'
import { formatEther } from 'viem'

const Profile = () => {
	const { address, isConnected } = useAccount()
	const { data: user, isLoading: userLoading } = useUser()
	const { data: stats, isLoading: statsLoading } = useUserStats()
	const { data: nftTokenIds, isLoading: nftsLoading } = useUserNFTs()

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-16">
					<Card className="max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Wallet className="h-5 w-5" />
								Connect Your Wallet
							</CardTitle>
							<CardDescription>
								Please connect your wallet to view your profile
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<a href="/">Go to Home</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	const formatAddress = (addr: string | undefined) => {
		if (!addr) return ''
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`
	}

	const userData = user?.data
	const statsData = stats?.data
	const totalPoints = statsData?.totalImpactPoints || 0
	const totalContributions = statsData?.totalContributions || 0

	// Calculate achievements based on stats
	const achievements = [
		{
			id: 1,
			title: 'First Steps',
			description: 'Logged your first environmental action',
			icon: Star,
			earned: totalContributions > 0,
		},
		{
			id: 2,
			title: 'Tree Planter',
			description: 'Planted 10 trees',
			icon: Leaf,
			earned: (statsData?.byActionType?.tree_planting || 0) >= 10,
		},
		{
			id: 3,
			title: 'Carbon Warrior',
			description: 'Reduced 100kg of CO₂',
			icon: Trophy,
			earned: (statsData?.totalCarbonReduced || 0) >= 100,
		},
		{
			id: 4,
			title: 'Eco Champion',
			description: 'Reached 1000 impact points',
			icon: Award,
			earned: totalPoints >= 1000,
		},
	]

	const earnedCount = achievements.filter((a) => a.earned).length

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-2">Profile</h1>
					<p className="text-muted-foreground">
						Manage your account and view your achievements
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Profile Info */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{userLoading || statsLoading ? (
									<div className="space-y-4">
										<Skeleton className="h-24 w-24 mx-auto rounded-full" />
										<Skeleton className="h-6 w-32 mx-auto" />
										<Skeleton className="h-4 w-48 mx-auto" />
									</div>
								) : (
									<>
										<div className="flex flex-col items-center gap-4">
											<Avatar className="h-24 w-24">
												<AvatarFallback className="text-2xl bg-primary text-primary-foreground">
													{formatAddress(address).slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="text-center">
												<p className="font-semibold text-lg">
													{userData?.name || 'EcoVault User'}
												</p>
												<p className="text-sm text-muted-foreground font-mono">
													{address}
												</p>
											</div>
										</div>

										<div className="pt-4 border-t space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">Wallet Address</span>
												<span className="text-sm font-mono">{formatAddress(address)}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">Total Impact Points</span>
												<span className="text-sm font-semibold">{totalPoints.toLocaleString()} pts</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">Total Actions</span>
												<span className="text-sm font-semibold">{totalContributions}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">Achievements</span>
												<span className="text-sm font-semibold">{earnedCount} / {achievements.length}</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">NFTs Owned</span>
												<span className="text-sm font-semibold">
													{nftsLoading ? '...' : (nftTokenIds?.data?.length || 0)}
												</span>
											</div>
										</div>
									</>
								)}

								<Button variant="outline" className="w-full gap-2">
									<Settings className="h-4 w-4" />
									Settings
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Achievements and NFTs */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Award className="h-5 w-5" />
									Achievements
								</CardTitle>
								<CardDescription>
									Your environmental impact milestones
								</CardDescription>
							</CardHeader>
							<CardContent>
								{statsLoading ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{[...Array(4)].map((_, i) => (
											<Skeleton key={i} className="h-24 w-full" />
										))}
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{achievements.map((achievement) => {
											const Icon = achievement.icon
											return (
												<Card
													key={achievement.id}
													className={`${
														achievement.earned
															? 'bg-gradient-to-br from-card to-muted/20 border-primary/20'
															: 'opacity-50 border-muted'
													}`}
												>
													<CardHeader className="pb-3">
														<div className="flex items-center gap-3">
															<div
																className={`h-10 w-10 rounded-lg flex items-center justify-center ${
																	achievement.earned
																		? 'bg-primary/10 text-primary'
																		: 'bg-muted text-muted-foreground'
																}`}
															>
																<Icon className="h-5 w-5" />
															</div>
															<div className="flex-1">
																<CardTitle className="text-base">{achievement.title}</CardTitle>
																<CardDescription className="text-xs">
																	{achievement.description}
																</CardDescription>
															</div>
														</div>
													</CardHeader>
													<CardContent>
														{achievement.earned ? (
															<Badge variant="secondary" className="text-xs">
																Earned
															</Badge>
														) : (
															<Badge variant="outline" className="text-xs">
																Locked
															</Badge>
														)}
													</CardContent>
												</Card>
											)
										})}
									</div>
								)}
							</CardContent>
						</Card>

						{/* NFTs Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ImageIcon className="h-5 w-5" />
									Impact NFTs
								</CardTitle>
								<CardDescription>
									Your proof-of-impact NFTs from project contributions
								</CardDescription>
							</CardHeader>
							<CardContent>
								{nftsLoading ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{[...Array(2)].map((_, i) => (
											<Skeleton key={i} className="h-32 w-full" />
										))}
									</div>
								) : !nftTokenIds?.data || nftTokenIds.data.length === 0 ? (
									<div className="text-center py-8">
										<ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-sm text-muted-foreground">No NFTs yet</p>
										<p className="text-xs text-muted-foreground mt-2">
											Fund projects with 0.01 ETH or more to receive Impact NFTs
										</p>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{nftTokenIds.data.map((tokenId: bigint) => (
											<Card key={tokenId.toString()} className="bg-gradient-to-br from-card to-muted/20">
												<CardContent className="p-4">
													<div className="flex items-center gap-3">
														<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
															<ImageIcon className="h-6 w-6 text-primary" />
														</div>
														<div className="flex-1">
															<p className="font-semibold">Impact NFT #{tokenId.toString()}</p>
															<p className="text-xs text-muted-foreground">Token ID: {tokenId.toString()}</p>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Profile

