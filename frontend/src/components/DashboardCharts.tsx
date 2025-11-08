import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format, subMonths, startOfMonth, formatDistanceToNow } from 'date-fns'

const COLORS = ['hsl(158, 45%, 35%)', 'hsl(140, 25%, 55%)', 'hsl(25, 75%, 60%)', 'hsl(200, 70%, 50%)']

interface Impact {
	actionType: string
	carbonReduced: number
	points: number
	createdAt: string
	description: string
	amount: string
}

interface DashboardChartsProps {
	impacts?: Impact[]
}

export function DashboardCharts({ impacts = [] }: DashboardChartsProps) {
	// Process impacts for monthly data
	const monthlyData = Array.from({ length: 6 }, (_, i) => {
		const month = subMonths(new Date(), 5 - i)
		const monthStart = startOfMonth(month)
		const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

		const monthImpacts = impacts.filter((impact) => {
			const impactDate = new Date(impact.createdAt)
			return impactDate >= monthStart && impactDate <= monthEnd
		})

		const co2 = monthImpacts.reduce((sum, impact) => sum + (impact.carbonReduced || 0), 0)
		const impact = monthImpacts.reduce((sum, impact) => sum + (impact.points || 0), 0)

		return {
			month: format(month, 'MMM'),
			co2: Math.round(co2),
			impact: Math.round(impact),
		}
	})

	// Process impacts for category data
	const categoryCounts: Record<string, number> = {}
	impacts.forEach((impact) => {
		const type = impact.actionType || 'other'
		categoryCounts[type] = (categoryCounts[type] || 0) + 1
	})

	const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
		name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
		value,
	}))

	// Get recent activities
	const recentActivities = impacts
		.slice(0, 3)
		.map((impact) => ({
			description: impact.description,
			points: impact.points,
			date: new Date(impact.createdAt),
		}))
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Monthly CO₂ Reduction Chart */}
			<Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
				<CardHeader>
					<CardTitle>Monthly CO₂ Reduction</CardTitle>
					<CardDescription>Track your carbon savings over the past 6 months</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={monthlyData}>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
							<YAxis stroke="hsl(var(--muted-foreground))" />
							<Tooltip 
								contentStyle={{ 
									backgroundColor: 'hsl(var(--card))', 
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px'
								}} 
							/>
							<Bar dataKey="co2" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Impact Trend Chart */}
			<Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
				<CardHeader>
					<CardTitle>Impact Trend</CardTitle>
					<CardDescription>Your overall impact score over time</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={monthlyData}>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
							<YAxis stroke="hsl(var(--muted-foreground))" />
							<Tooltip 
								contentStyle={{ 
									backgroundColor: 'hsl(var(--card))', 
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px'
								}} 
							/>
							<Line 
								type="monotone" 
								dataKey="impact" 
								stroke="hsl(var(--primary))" 
								strokeWidth={2}
								dot={{ fill: 'hsl(var(--primary))' }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Impact by Category */}
			<Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
				<CardHeader>
					<CardTitle>Impact by Category</CardTitle>
					<CardDescription>Distribution of your environmental actions</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center">
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={categoryData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
								outerRadius={100}
								fill="#8884d8"
								dataKey="value"
							>
								{categoryData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip 
								contentStyle={{ 
									backgroundColor: 'hsl(var(--card))', 
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px'
								}} 
							/>
						</PieChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>Your latest environmental actions</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentActivities.length > 0 ? (
							recentActivities.map((activity, index) => {
								const timeAgo = formatDistanceToNow(activity.date, { addSuffix: true })
								return (
									<div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
										<div>
											<p className="font-medium">{activity.description}</p>
											<p className="text-sm text-muted-foreground">{timeAgo}</p>
										</div>
										<span className="text-sm font-semibold text-primary">+{activity.points} pts</span>
									</div>
								)
							})
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

