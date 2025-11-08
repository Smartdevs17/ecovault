import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardMetrics } from '@/components/DashboardMetrics'
import { DashboardCharts } from '@/components/DashboardCharts'
import { useAccount } from 'wagmi'
import { Wallet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useUserStats } from '@/hooks/useUsers'
import { useUserImpact } from '@/hooks/useImpact'
import { Skeleton } from '@/components/ui/skeleton'

const Dashboard = () => {
	const { isConnected, address } = useAccount()
	const { data: stats, isLoading: statsLoading, error: statsError } = useUserStats()
	const { data: impactData, isLoading: impactLoading } = useUserImpact()

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
								Please connect your wallet to view your dashboard
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<Link to="/">Go to Home</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (statsLoading || impactLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="text-4xl font-bold mb-2">Dashboard</h1>
						<Skeleton className="h-6 w-64" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{[...Array(6)].map((_, i) => (
							<Skeleton key={i} className="h-32" />
						))}
					</div>
				</div>
			</div>
		)
	}

	if (statsError) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-8">
					<Card className="max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle>Error Loading Dashboard</CardTitle>
							<CardDescription>
								{statsError instanceof Error ? statsError.message : 'Failed to load dashboard data'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button onClick={() => window.location.reload()}>Retry</Button>
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
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back! Here's your environmental impact overview.
					</p>
				</div>

				<DashboardMetrics stats={stats?.data} />
				<DashboardCharts impacts={impactData?.data?.impacts || []} />
			</div>
		</div>
	)
}

export default Dashboard

