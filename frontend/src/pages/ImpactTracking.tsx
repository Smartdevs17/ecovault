import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Recycle, Wind, Droplet, Zap, TreePine, Activity, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useUserImpact, useLogImpact } from '@/hooks/useImpact'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

const actionTypes = [
	{ value: 'recycling', label: 'Recycling', icon: Recycle, color: 'text-secondary' },
	{ value: 'transport', label: 'Public Transport', icon: Wind, color: 'text-primary' },
	{ value: 'water', label: 'Water Conservation', icon: Droplet, color: 'text-accent' },
	{ value: 'energy', label: 'Energy Saving', icon: Zap, color: 'text-primary' },
	{ value: 'tree_planting', label: 'Tree Planting', icon: TreePine, color: 'text-secondary' },
]

const ImpactTracking = () => {
	const { isConnected, address } = useAccount()
	const { data: impactData, isLoading, error } = useUserImpact()
	const logImpact = useLogImpact()
	const { toast } = useToast()
	
	const [showForm, setShowForm] = useState(false)
	const [formData, setFormData] = useState({
		type: '',
		amount: '',
		description: '',
		carbonReduced: '',
		waterSaved: '',
	})

	const impacts = impactData?.data?.impacts || []
	const recentActions = impacts.slice(0, 10).map((impact: any) => ({
		id: impact._id || impact.id,
		type: impact.actionType,
		description: impact.description,
		date: new Date(impact.createdAt),
		points: impact.points || 0,
	}))

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!isConnected || !address) {
			toast({
				title: 'Wallet Not Connected',
				description: 'Please connect your wallet to log impact actions',
				variant: 'destructive',
			})
			return
		}

		if (!formData.type || !formData.description) {
			toast({
				title: 'Validation Error',
				description: 'Please fill in all required fields',
				variant: 'destructive',
			})
			return
		}

		try {
			await logImpact.mutateAsync({
				actionType: formData.type,
				amount: formData.amount,
				description: formData.description,
				carbonReduced: parseFloat(formData.carbonReduced) || 0,
				waterSaved: formData.waterSaved ? parseFloat(formData.waterSaved) : undefined,
			})

			toast({
				title: 'Success',
				description: 'Impact action logged successfully!',
			})

			setShowForm(false)
			setFormData({ type: '', amount: '', description: '', carbonReduced: '', waterSaved: '' })
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to log impact action',
				variant: 'destructive',
			})
		}
	}

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-16">
					<Card className="max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Connect Your Wallet
							</CardTitle>
							<CardDescription>
								Please connect your wallet to log impact actions
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

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-4xl font-bold mb-2">Impact Tracking</h1>
						<p className="text-muted-foreground">
							Log your eco-friendly actions and track your environmental impact
						</p>
					</div>
					<Button onClick={() => setShowForm(!showForm)} className="gap-2" disabled={logImpact.isPending}>
						<Plus className="h-4 w-4" />
						Log Action
					</Button>
				</div>

				{showForm && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Log New Action</CardTitle>
							<CardDescription>
								Record your environmental action to track your impact
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="type">Action Type *</Label>
									<Select
										value={formData.type}
										onValueChange={(value) => setFormData({ ...formData, type: value })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select action type" />
										</SelectTrigger>
										<SelectContent>
											{actionTypes.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													<div className="flex items-center gap-2">
														<type.icon className="h-4 w-4" />
														{type.label}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="amount">Amount / Quantity</Label>
									<Input
										id="amount"
										placeholder="e.g., 5 kg, 10 km"
										value={formData.amount}
										onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description *</Label>
									<Textarea
										id="description"
										placeholder="Add details about your action..."
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										rows={4}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="carbonReduced">Carbon Reduced (kg)</Label>
										<Input
											id="carbonReduced"
											type="number"
											step="0.1"
											placeholder="0"
											value={formData.carbonReduced}
											onChange={(e) => setFormData({ ...formData, carbonReduced: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="waterSaved">Water Saved (L)</Label>
										<Input
											id="waterSaved"
											type="number"
											step="0.1"
											placeholder="0"
											value={formData.waterSaved}
											onChange={(e) => setFormData({ ...formData, waterSaved: e.target.value })}
										/>
									</div>
								</div>

								<div className="flex gap-2">
									<Button type="submit" disabled={logImpact.isPending}>
										{logImpact.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										Submit Action
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setShowForm(false)
											setFormData({ type: '', amount: '', description: '', carbonReduced: '', waterSaved: '' })
										}}
										disabled={logImpact.isPending}
									>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Activity className="h-5 w-5" />
									Recent Actions
								</CardTitle>
								<CardDescription>
									Your logged environmental actions
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoading ? (
									<div className="space-y-4">
										{[...Array(3)].map((_, i) => (
											<Skeleton key={i} className="h-20 w-full" />
										))}
									</div>
								) : error ? (
									<div className="text-center py-4">
										<p className="text-sm text-muted-foreground">
											{error instanceof Error ? error.message : 'Failed to load impacts'}
										</p>
									</div>
								) : recentActions.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-sm text-muted-foreground">No impact actions logged yet</p>
										<p className="text-xs text-muted-foreground mt-2">Start logging your environmental actions!</p>
									</div>
								) : (
									<div className="space-y-4">
										{recentActions.map((action) => {
											const actionType = actionTypes.find((t) => t.value === action.type)
											const Icon = actionType?.icon || Activity
											
											return (
												<div
													key={action.id}
													className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
												>
													<div className="flex items-center gap-4">
														<div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${actionType?.color || 'text-primary'}`}>
															<Icon className="h-5 w-5" />
														</div>
														<div>
															<p className="font-medium">{action.description}</p>
															<p className="text-sm text-muted-foreground">
																{formatDistanceToNow(action.date, { addSuffix: true })}
															</p>
														</div>
													</div>
													<Badge variant="secondary" className="text-sm font-semibold">
														+{action.points} pts
													</Badge>
												</div>
											)
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div>
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>
									Common environmental actions
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								{actionTypes.map((type) => {
									const Icon = type.icon
									return (
										<Button
											key={type.value}
											variant="outline"
											className="w-full justify-start gap-2"
											onClick={() => {
												setFormData({ ...formData, type: type.value })
												setShowForm(true)
											}}
										>
											<Icon className={`h-4 w-4 ${type.color}`} />
											{type.label}
										</Button>
									)
								})}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ImpactTracking

