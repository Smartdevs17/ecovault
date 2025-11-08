import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProject, useVerifyProject } from '@/hooks/useProjects'
import { useProject as useProjectOnChain, useIsUserVerifier } from '@/hooks/useProjectRegistry'
import { useQueryClient } from '@tanstack/react-query'
import { useETHPrice } from '@/hooks/useETHPrice'
import { useProjectTotalContributions, useUserContributionOnChain } from '@/hooks/useEcoVault'
import { FundProjectDialog } from '@/components/FundProjectDialog'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Leaf, Users, MapPin, Coins, Calendar, CheckCircle, XCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const ProjectDetail = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { isConnected, address } = useAccount()
	
	const { data: project, isLoading, error } = useProject(id)
	const projectData = project?.data

	// Get on-chain data if onChainId exists
	const onChainId = projectData?.onChainId ? BigInt(projectData.onChainId) : undefined
	const { data: onChainProject } = useProjectOnChain(onChainId)
	const { data: totalContributions } = useProjectTotalContributions(onChainId)
	const { data: userContribution } = useUserContributionOnChain(onChainId)
	const verifyProjectMutation = useVerifyProject()
	const { toast } = useToast()
	const { isVerifier } = useIsUserVerifier()
	const queryClient = useQueryClient()
	const { data: ethPrice } = useETHPrice()

	// Safely convert funding values
	let fundsRaised = 0
	let fundsGoal = 0
	
	if (projectData) {
		try {
			// Use totalFunds from backend (synced from blockchain)
			if (projectData.totalFunds) {
				const totalFundsValue = typeof projectData.totalFunds === 'string' 
					? (projectData.totalFunds.includes('.') ? parseFloat(projectData.totalFunds) : BigInt(projectData.totalFunds))
					: projectData.totalFunds
				fundsRaised = typeof totalFundsValue === 'bigint' 
					? Number(formatEther(totalFundsValue))
					: Number(formatEther(BigInt(totalFundsValue)))
			}
		} catch (e) {
			// Ignore parsing errors
		}
		
		try {
			if (projectData.fundingGoal) {
				const fundingGoalStr = String(projectData.fundingGoal)
				// Check if it's in wei format (large integer) or ETH format (decimal)
				if (fundingGoalStr.includes('.')) {
					// Already in ETH format, use directly
					fundsGoal = parseFloat(fundingGoalStr)
				} else {
					// In wei format, convert to ETH
					try {
						fundsGoal = Number(formatEther(BigInt(fundingGoalStr)))
					} catch {
						// If BigInt conversion fails, try parsing as float
						fundsGoal = parseFloat(fundingGoalStr)
					}
				}
			}
		} catch (e) {
			// Ignore parsing errors
		}
	}

	// Use on-chain total contributions if available (fallback/real-time update)
	if (totalContributions?.data) {
		fundsRaised = Number(formatEther(totalContributions.data))
	}

	const progress = fundsGoal > 0 ? (fundsRaised / fundsGoal) * 100 : 0
	const userContributionAmount = userContribution?.data ? Number(formatEther(userContribution.data)) : 0
	
	// Convert to USD if ETH price is available
	const fundsRaisedUSD = ethPrice ? fundsRaised * ethPrice : 0
	const fundsGoalUSD = ethPrice ? fundsGoal * ethPrice : 0

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-8">
					<Skeleton className="h-10 w-64 mb-4" />
					<Skeleton className="h-96 w-full" />
				</div>
			</div>
		)
	}

	if (error || !projectData) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-8">
					<Card className="max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle>Project Not Found</CardTitle>
							<CardDescription>
								{error instanceof Error ? error.message : 'The project you are looking for does not exist.'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button onClick={() => navigate('/projects')} className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back to Projects
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<Button
					variant="ghost"
					onClick={() => navigate('/projects')}
					className="mb-6 gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Projects
				</Button>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<CardTitle className="text-3xl">{projectData.name}</CardTitle>
											<Badge variant={projectData?.isVerified ? 'default' : 'secondary'}>
												{projectData?.isVerified ? (
													<>
														<CheckCircle className="h-3 w-3 mr-1" />
														Verified
													</>
												) : (
													<>
														<XCircle className="h-3 w-3 mr-1" />
														Pending
													</>
												)}
											</Badge>
										</div>
										<CardDescription className="text-base">
											{projectData.description}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Funding Progress */}
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Funding Progress</span>
										<span className="font-semibold">
											{ethPrice ? (
												<>
													${fundsRaisedUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} / ${fundsGoalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
													<span className="text-muted-foreground text-xs ml-2">
														({fundsRaised.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH / {fundsGoal.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH)
													</span>
												</>
											) : (
												<>
													{fundsRaised.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH / {fundsGoal.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
												</>
											)}
										</span>
									</div>
									<div className="w-full bg-muted rounded-full h-3">
										<div 
											className="bg-primary h-3 rounded-full transition-all"
											style={{ width: `${Math.min(progress, 100)}%` }}
										/>
									</div>
									<p className="text-xs text-muted-foreground">
										{progress.toFixed(1)}% funded
									</p>
								</div>

								{/* Project Stats */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
									<div>
										<p className="text-sm text-muted-foreground">Owner</p>
										<p className="text-sm font-mono truncate">{projectData.owner}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Status</p>
										<p className="text-sm font-semibold">{projectData?.isActive ? 'Active' : 'Inactive'}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Contributors</p>
										<p className="text-sm font-semibold">{projectData.contributors || 0}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Created</p>
										<p className="text-sm">
											{projectData.createdAt ? format(new Date(projectData.createdAt), 'MMM d, yyyy') : 'N/A'}
										</p>
									</div>
								</div>

								{/* User Contribution */}
								{isConnected && userContributionAmount > 0 && (
									<div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
										<p className="text-sm font-semibold mb-1">Your Contribution</p>
										<p className="text-2xl font-bold text-primary">
											{userContributionAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* On-Chain Data */}
						{onChainProject?.data && (
							<Card>
								<CardHeader>
									<CardTitle>On-Chain Information</CardTitle>
									<CardDescription>
										Data from the blockchain
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">On-Chain ID</span>
										<span className="text-sm font-mono">{onChainProject.data.id?.toString()}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">On-Chain Verified</span>
										<Badge variant={onChainProject.data.isVerified ? 'default' : 'secondary'}>
											{onChainProject.data.isVerified ? 'Yes' : 'No'}
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">On-Chain Active</span>
										<Badge variant={onChainProject.data.isActive ? 'default' : 'secondary'}>
											{onChainProject.data.isActive ? 'Yes' : 'No'}
										</Badge>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{isConnected && projectData?.isVerified ? (
									<FundProjectDialog
										projectId={onChainId || BigInt(0)}
										projectName={projectData.name}
										onSuccess={async () => {
											// Refetch project data immediately after funding
											if (id) {
												await queryClient.refetchQueries({ queryKey: ['project', id] })
												// Also refetch on-chain data
												if (onChainId) {
													queryClient.invalidateQueries({ queryKey: ['projectTotalContributions'] })
													queryClient.invalidateQueries({ queryKey: ['userContribution'] })
												}
											}
										}}
									>
										<Button className="w-full gap-2">
											<Coins className="h-4 w-4" />
											Fund Project
										</Button>
									</FundProjectDialog>
								) : (
									<Button disabled className="w-full gap-2">
										<Coins className="h-4 w-4" />
										{!isConnected ? 'Connect Wallet to Fund' : 'Project Not Verified'}
									</Button>
								)}
								
								{!projectData?.isVerified && isVerifier && (
									<Button
										variant="default"
										className="w-full gap-2"
										onClick={async () => {
											if (!id) return
											try {
												await verifyProjectMutation.mutateAsync(id)
												// Refetch project data immediately
												await queryClient.refetchQueries({ queryKey: ['project', id] })
												toast({
													title: 'Project Verified',
													description: 'Project has been verified successfully!',
												})
											} catch (error) {
												toast({
													title: 'Verification Failed',
													description: error instanceof Error ? error.message : 'Failed to verify project',
													variant: 'destructive',
												})
											}
										}}
										disabled={verifyProjectMutation.isPending}
									>
										{verifyProjectMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Verifying...
											</>
										) : (
											<>
												<ShieldCheck className="h-4 w-4" />
												Verify Project
											</>
										)}
									</Button>
								)}
								
								<Button variant="outline" className="w-full" asChild>
									<Link to="/projects">Back to Projects</Link>
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Project Info</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2 text-sm">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">Created:</span>
									<span>{projectData.createdAt ? format(new Date(projectData.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
								</div>
								{projectData.location && (
									<div className="flex items-center gap-2 text-sm">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span>{projectData.location}</span>
									</div>
								)}
								<div className="flex items-center gap-2 text-sm">
									<Users className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">Contributors:</span>
									<span>{projectData.contributors || 0}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProjectDetail

