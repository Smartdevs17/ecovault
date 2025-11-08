import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTotalDeposits, useAvailableYield } from '@/hooks/useTreasuryVault'
import { useETHPrice } from '@/hooks/useETHPrice'
import { formatEther } from 'viem'
import { TrendingUp, DollarSign, Coins, Activity } from 'lucide-react'

export function YieldMetrics() {
	const { data: totalDeposits, isLoading: depositsLoading } = useTotalDeposits()
	const { data: availableYield, isLoading: yieldLoading } = useAvailableYield()
	const { data: ethPrice } = useETHPrice()

	const totalDepositsETH = totalDeposits ? Number(formatEther(totalDeposits)) : 0
	const availableYieldETH = availableYield ? Number(formatEther(availableYield)) : 0
	const totalDepositsUSD = ethPrice ? totalDepositsETH * ethPrice : 0
	const availableYieldUSD = ethPrice ? availableYieldETH * ethPrice : 0

	if (depositsLoading || yieldLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Yield Metrics</CardTitle>
					<CardDescription>Total yield generated and available for distribution</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Yield Metrics
				</CardTitle>
				<CardDescription>Total yield generated and available for distribution</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Total Deposits */}
					<div className="p-4 rounded-lg bg-muted/50 border">
						<div className="flex items-center gap-2 mb-2">
							<Coins className="h-4 w-4 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">Total Deposits</p>
						</div>
						<p className="text-2xl font-bold">
							{ethPrice ? (
								<>
									${totalDepositsUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
									<span className="text-sm text-muted-foreground ml-2">
										({totalDepositsETH.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH)
									</span>
								</>
							) : (
								<>
									{totalDepositsETH.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
								</>
							)}
						</p>
					</div>

					{/* Available Yield */}
					<div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
						<div className="flex items-center gap-2 mb-2">
							<Activity className="h-4 w-4 text-primary" />
							<p className="text-sm text-muted-foreground">Available Yield</p>
						</div>
						<p className="text-2xl font-bold text-primary">
							{ethPrice ? (
								<>
									${availableYieldUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
									<span className="text-sm text-muted-foreground ml-2">
										({availableYieldETH.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH)
									</span>
								</>
							) : (
								<>
									{availableYieldETH.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
								</>
							)}
						</p>
					</div>
				</div>

				{/* Yield Rate Info */}
				{totalDepositsETH > 0 && (
					<div className="pt-4 border-t">
						<p className="text-xs text-muted-foreground">
							Yield is automatically distributed to verified projects via Octant V2 based on impact scores.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

