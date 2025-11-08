/**
 * Dialog component for funding a project on-chain
 */

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useFundProject } from '@/hooks/useEcoVault'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Coins } from 'lucide-react'
import { formatEther } from 'viem'

interface FundProjectDialogProps {
	projectId: bigint
	projectName: string
	children?: React.ReactNode
	onSuccess?: () => void // Callback for when funding succeeds
}

export function FundProjectDialog({ projectId, projectName, children, onSuccess }: FundProjectDialogProps) {
	const { isConnected, address } = useAccount()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const [open, setOpen] = useState(false)
	const [amount, setAmount] = useState('')
	const hasHandledSuccessRef = useRef(false)

	const { fundProject, isPending, isConfirming, isSuccess, error, reset } = useFundProject()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!isConnected || !address) {
			toast({
				title: 'Wallet Not Connected',
				description: 'Please connect your wallet to fund a project',
				variant: 'destructive',
			})
			return
		}

		if (!amount || parseFloat(amount) <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Please enter a valid funding amount',
				variant: 'destructive',
			})
			return
		}

		try {
			await fundProject(projectId, amount)
			
			toast({
				title: 'Transaction Submitted',
				description: 'Funding project on blockchain...',
			})
		} catch (err) {
			toast({
				title: 'Error',
				description: err instanceof Error ? err.message : 'Failed to fund project',
				variant: 'destructive',
			})
		}
	}

	useEffect(() => {
		if (isSuccess && !hasHandledSuccessRef.current) {
			hasHandledSuccessRef.current = true
			
			// Immediately invalidate queries to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['projects'] })
			queryClient.invalidateQueries({ queryKey: ['project'] })
			queryClient.invalidateQueries({ queryKey: ['projectTotalContributions'] })
			queryClient.invalidateQueries({ queryKey: ['userContribution'] })
			queryClient.invalidateQueries({ queryKey: ['projectFundings'] })
			
			// Wait a moment for transaction to be indexed, then force refetch
			const refreshData = async () => {
				// Small delay to allow blockchain to index the transaction
				await new Promise(resolve => setTimeout(resolve, 1500))
				
				// Force refetch all project-related queries
				await Promise.all([
					queryClient.refetchQueries({ queryKey: ['projects'] }),
					queryClient.refetchQueries({ queryKey: ['project'] }),
					queryClient.refetchQueries({ queryKey: ['projectTotalContributions'] }),
					queryClient.refetchQueries({ queryKey: ['userContribution'] }),
				])
			}
			
			refreshData()
			
			toast({
				title: 'Success',
				description: 'Project funded successfully! NFT will be minted if threshold is met.',
			})
			
			// Call onSuccess callback if provided
			if (onSuccess) {
				onSuccess()
			}
			
			setOpen(false)
			setAmount('')
		}
	}, [isSuccess, toast, queryClient, onSuccess])

	// Reset success tracking and wagmi state when dialog closes
	useEffect(() => {
		if (!open) {
			hasHandledSuccessRef.current = false
			reset() // Reset wagmi state when dialog closes
		}
	}, [open, reset])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button size="sm">
						<Coins className="h-4 w-4 mr-2" />
						Fund Project
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Fund Project</DialogTitle>
					<DialogDescription>
						Fund {projectName} on the blockchain. Minimum: 0.001 ETH. NFT minted at 0.01 ETH.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="amount">Amount (ETH) *</Label>
						<Input
							id="amount"
							type="number"
							step="0.001"
							min="0.001"
							placeholder="e.g., 0.01"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Minimum: 0.001 ETH | NFT threshold: 0.01 ETH
						</p>
					</div>

					{error && (
						<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
							{error instanceof Error ? error.message : 'Transaction failed'}
						</div>
					)}

					<div className="flex gap-2 justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending || isConfirming}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending || isConfirming}>
							{(isPending || isConfirming) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isPending ? 'Confirm in Wallet...' : isConfirming ? 'Funding...' : 'Fund Project'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

