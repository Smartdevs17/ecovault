import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wind, Recycle, Droplet, Zap, TreePine, TrendingUp } from 'lucide-react'

interface MetricCardProps {
	title: string
	value: string
	change?: string
	icon: React.ComponentType<{ className?: string }>
	iconColor?: string
}

const MetricCard = ({ title, value, change, icon: Icon, iconColor = 'text-primary' }: MetricCardProps) => {
	return (
		<Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 hover:shadow-lg transition-all duration-300">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				<Icon className={`h-4 w-4 ${iconColor}`} />
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold">{value}</div>
				{change && (
					<p className="text-xs text-muted-foreground mt-1">{change}</p>
				)}
			</CardContent>
		</Card>
	)
}

interface DashboardMetricsProps {
	stats?: {
		totalCarbonReduced?: number
		totalWaterSaved?: number
		totalImpactPoints?: number
		totalContributions?: number
		byActionType?: Record<string, number>
	}
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
	// Calculate metrics from stats
	const co2Reduced = stats?.totalCarbonReduced || 0
	const waterSaved = stats?.totalWaterSaved || 0
	const totalImpact = stats?.totalImpactPoints || 0
	const totalContributions = stats?.totalContributions || 0

	// Calculate from action types
	const byActionType = stats?.byActionType || {}
	const wasteRecycled = byActionType.recycling || 0
	const greenEnergy = byActionType.energy || 0
	const treesPlanted = byActionType.tree_planting || 0

	const data = {
		co2Reduced,
		wasteRecycled,
		waterSaved,
		greenEnergy,
		treesPlanted,
		totalImpact,
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			<MetricCard
				title="CO₂ Reduced"
				value={`${data.co2Reduced.toLocaleString()} kg`}
				change="+12% from last month"
				icon={Wind}
				iconColor="text-primary"
			/>
			<MetricCard
				title="Waste Recycled"
				value={`${data.wasteRecycled.toLocaleString()} kg`}
				change="+8% from last month"
				icon={Recycle}
				iconColor="text-secondary"
			/>
			<MetricCard
				title="Water Saved"
				value={`${data.waterSaved.toLocaleString()} L`}
				change="+15% from last month"
				icon={Droplet}
				iconColor="text-accent"
			/>
			<MetricCard
				title="Green Energy"
				value={`${data.greenEnergy.toLocaleString()} kWh`}
				change="+20% from last month"
				icon={Zap}
				iconColor="text-primary"
			/>
			<MetricCard
				title="Trees Planted"
				value={`${data.treesPlanted.toLocaleString()}`}
				change="+5% from last month"
				icon={TreePine}
				iconColor="text-secondary"
			/>
			<MetricCard
				title="Total Impact Score"
				value={`${data.totalImpact.toLocaleString()}`}
				change="+18% from last month"
				icon={TrendingUp}
				iconColor="text-accent"
			/>
		</div>
	)
}

