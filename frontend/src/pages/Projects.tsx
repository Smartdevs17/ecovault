import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Leaf, Users, MapPin, Coins, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { useETHPrice } from '@/hooks/useETHPrice'
import { formatEther } from 'viem'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
import { FundProjectDialog } from '@/components/FundProjectDialog'
import { YieldMetrics } from '@/components/YieldMetrics'
import { useAccount } from 'wagmi'

const Projects = () => {
	const { isConnected } = useAccount()
	const { data, isLoading, error } = useProjects({ active: 'true' })
	const { data: ethPrice } = useETHPrice()
	const projects = data?.data || []

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-4xl font-bold mb-2">Sustainability Projects</h1>
						<p className="text-muted-foreground">
							Discover and support environmental initiatives
						</p>
					</div>
					{isConnected ? (
						<CreateProjectDialog />
					) : (
						<Button disabled className="gap-2">
							<Plus className="h-4 w-4" />
							Connect Wallet to Create
						</Button>
					)}
				</div>

				{/* Yield Metrics Dashboard */}
				<div className="mb-8">
					<YieldMetrics />
				</div>

				{isLoading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-6 w-3/4 mb-2" />
									<Skeleton className="h-4 w-full" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-20 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{error && (
					<Card className="max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle>Error Loading Projects</CardTitle>
							<CardDescription>
								{error instanceof Error ? error.message : 'Failed to load projects'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button onClick={() => window.location.reload()}>Retry</Button>
						</CardContent>
					</Card>
				)}

				{!isLoading && !error && (
					<>
						{projects.length === 0 ? (
							<Card className="max-w-2xl mx-auto">
								<CardHeader>
									<CardTitle>No Projects Found</CardTitle>
									<CardDescription>
										Be the first to create a sustainability project!
									</CardDescription>
								</CardHeader>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{projects.map((project: any) => {
									let fundsRaised = 0
									let fundsGoal = 0
									
									try {
										if (project.totalFunds) {
											const totalFundsStr = String(project.totalFunds)
											if (totalFundsStr.includes('.')) {
												fundsRaised = parseFloat(totalFundsStr)
											} else {
												fundsRaised = Number(formatEther(BigInt(totalFundsStr)))
											}
										}
									} catch (e) {
										fundsRaised = 0
									}
									
									try {
										if (project.fundingGoal) {
											const fundingGoalStr = String(project.fundingGoal)
											if (fundingGoalStr.includes('.')) {
												fundsGoal = parseFloat(fundingGoalStr)
											} else {
												try {
													fundsGoal = Number(formatEther(BigInt(fundingGoalStr)))
												} catch {
													fundsGoal = parseFloat(fundingGoalStr)
												}
											}
										}
									} catch (e) {
										fundsGoal = 0
									}
									
									const progress = fundsGoal > 0 ? (fundsRaised / fundsGoal) * 100 : 0
									const status = project.active ? 'active' : 'funding'
									const fundsRaisedUSD = ethPrice ? fundsRaised * ethPrice : 0
									const fundsGoalUSD = ethPrice ? fundsGoal * ethPrice : 0
									
									return (
										<Card key={project._id || project.id} className="hover:shadow-lg transition-all duration-300">
											<CardHeader>
												<div className="flex items-start justify-between mb-2">
													<CardTitle className="text-xl">{project.name}</CardTitle>
													<Badge 
														variant={status === 'active' ? 'default' : 'secondary'}
													>
														{status}
													</Badge>
												</div>
												<CardDescription className="line-clamp-2">
													{project.description}
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="space-y-2">
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">Funds Raised</span>
														<span className="font-semibold flex items-center gap-1">
															{ethPrice ? (
																<>
																	${fundsRaisedUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} / ${fundsGoalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
																		</TooltipTrigger>
																		<TooltipContent>
																			<p>{fundsRaised.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH / {fundsGoal.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH</p>
																		</TooltipContent>
																	</Tooltip>
																</>
															) : (
																<>
																	{fundsRaised.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH / {fundsGoal.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
																</>
															)}
														</span>
													</div>
													<div className="w-full bg-muted rounded-full h-2">
														<div 
															className="bg-primary h-2 rounded-full transition-all"
															style={{ width: `${Math.min(progress, 100)}%` }}
														/>
													</div>
												</div>

												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													<div className="flex items-center gap-1">
														<Users className="h-4 w-4" />
														<span>{project.contributors || 0}</span>
													</div>
													{project.location && (
														<div className="flex items-center gap-1">
															<MapPin className="h-4 w-4" />
															<span>{project.location}</span>
														</div>
													)}
												</div>

												<div className="flex items-center justify-between pt-2 border-t">
													<Badge variant="outline" className="gap-1">
														<Leaf className="h-3 w-3" />
														{project.isVerified ? 'Verified' : 'Pending'}
													</Badge>
													<div className="flex gap-2">
														{isConnected && project.isVerified && (
															<FundProjectDialog
																projectId={BigInt(project.onChainId || 0)}
																projectName={project.name}
															>
																<Button size="sm" variant="default">
																	<Coins className="h-3 w-3 mr-1" />
																	Fund
																</Button>
															</FundProjectDialog>
														)}
														<Button variant="outline" size="sm" asChild>
															<Link to={`/projects/${project._id || project.id}`}>View Details</Link>
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									)
								})}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default Projects

