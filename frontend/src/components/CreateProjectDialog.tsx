/**
 * Dialog component for creating a new project on-chain
 */

import { useState, useEffect, useRef } from 'react'
import { useAccount, useChainId, useSwitchChain, useConnectorClient } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { addChain } from 'viem/actions'
import { decodeEventLog, getEventSelector } from 'viem'
import { useCreateProject } from '@/hooks/useProjectRegistry'
import { useCreateProject as useCreateProjectAPI } from '@/hooks/useProjects'
import { useToast } from '@/hooks/use-toast'
import { SUPPORTED_NETWORK, NETWORK_NAME } from '@/lib/web3-config'
import { projectRegistryContract } from '@/lib/contracts/abis'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus } from 'lucide-react'

interface CreateProjectDialogProps {
	children?: React.ReactNode
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
	const { isConnected, address } = useAccount()
	const chainId = useChainId()
	const { switchChain } = useSwitchChain()
	const { data: client } = useConnectorClient()
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		fundingGoal: '',
	})
	const hasSyncedRef = useRef(false) // Track if we've already synced
	const pendingSyncRef = useRef<string | null>(null) // Track pending sync data

	const { createProject, isPending, isConfirming, isSuccess, isReceiptError, receiptError, receipt, error, reset } = useCreateProject()
	const createProjectAPI = useCreateProjectAPI()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!isConnected || !address) {
			toast({
				title: 'Wallet Not Connected',
				description: 'Please connect your wallet to create a project',
				variant: 'destructive',
			})
			return
		}

		// Check if user is on Base Sepolia testnet
		if (chainId !== SUPPORTED_NETWORK.BASE_SEPOLIA) {
			toast({
				title: 'Wrong Network',
				description: `You're on chain ID ${chainId}. Please switch to ${NETWORK_NAME} (${SUPPORTED_NETWORK.BASE_SEPOLIA}) to create projects.`,
				variant: 'destructive',
			})
			
			// Try to switch to Base Sepolia, add chain if needed
			try {
				await switchChain({ chainId: SUPPORTED_NETWORK.BASE_SEPOLIA })
		} catch (err: unknown) {
			// If switch fails (chain not added), try to add it first
			const error = err as { code?: number; message?: string }
			if (error?.code === 4902 || error?.message?.includes('not added')) {
					try {
						// Add Base Sepolia to wallet using viem's addChain
						if (client) {
							await addChain(client, { chain: baseSepolia })
							// Then switch to it
							await switchChain({ chainId: SUPPORTED_NETWORK.BASE_SEPOLIA })
						} else {
							throw new Error('Wallet not connected')
						}
						toast({
							title: 'Network Added',
							description: 'Base Sepolia has been added to your wallet. Please try again.',
						})
					} catch (addErr) {
						toast({
							title: 'Network Switch Failed',
							description: 'Please manually add Base Sepolia to your wallet and try again.',
							variant: 'destructive',
						})
					}
				} else {
					toast({
						title: 'Network Switch Failed',
						description: `Please manually switch to ${NETWORK_NAME} in your wallet`,
						variant: 'destructive',
					})
				}
			}
			return
		}

		if (!formData.name || !formData.description || !formData.fundingGoal) {
			toast({
				title: 'Validation Error',
				description: 'Please fill in all fields',
				variant: 'destructive',
			})
			return
		}

		// Reset sync tracking
		hasSyncedRef.current = false
		pendingSyncRef.current = JSON.stringify(formData)

		// Create project on-chain
		createProject(formData.name, formData.description, formData.fundingGoal)
	}

	// Handle transaction success - only sync once
	useEffect(() => {
		if (isSuccess && receipt && address && pendingSyncRef.current && !hasSyncedRef.current && !createProjectAPI.isPending) {
			hasSyncedRef.current = true
			
			const syncData = JSON.parse(pendingSyncRef.current)
			
			// Parse ProjectCreated event from receipt to get onChainId
			let onChainId: number | undefined
			try {
				if (receipt.logs && projectRegistryContract.address && projectRegistryContract.abi) {
					// Find ProjectCreated event in ABI
					const projectCreatedEventAbi = projectRegistryContract.abi.find(
						(item) => item.type === 'event' && item.name === 'ProjectCreated'
					)
					
					if (projectCreatedEventAbi && projectCreatedEventAbi.type === 'event') {
						// Compute event signature from ABI instead of hardcoding
						const eventSignature = getEventSelector(projectCreatedEventAbi)
						
						const projectCreatedLog = receipt.logs.find((log) => {
							return log.address.toLowerCase() === projectRegistryContract.address.toLowerCase() &&
								log.topics[0] === eventSignature
						})
						
						if (projectCreatedLog) {
							try {
								const decoded = decodeEventLog({
									abi: [projectCreatedEventAbi],
									data: projectCreatedLog.data,
									topics: projectCreatedLog.topics,
								}) as { args?: { id?: bigint | number | string } }
								
								if (decoded?.args?.id !== undefined && decoded.args.id !== null) {
									onChainId = Number(decoded.args.id)
								}
							} catch {
								// Ignore parsing errors
							}
						}
					}
				}
			} catch (err) {
				// If parsing fails, onChainId will be undefined and can be updated later
			}
			
			// Create project in backend to sync
			createProjectAPI.mutate(
				{
					name: syncData.name,
					description: syncData.description,
					fundingGoal: syncData.fundingGoal,
					owner: address,
					onChainId: onChainId,
				},
				{
					onSuccess: () => {
						toast({
							title: 'Success',
							description: 'Project created successfully!',
						})
						setOpen(false)
						setFormData({ name: '', description: '', fundingGoal: '' })
						pendingSyncRef.current = null
					},
					onError: (error) => {
						toast({
							title: 'Warning',
							description: 'Project created on blockchain but failed to sync with backend',
							variant: 'destructive',
						})
						hasSyncedRef.current = false
					},
				}
			)
		}
	}, [isSuccess, receipt, address, createProjectAPI, toast])

	// Reset sync tracking when dialog closes
	useEffect(() => {
		if (!open) {
			hasSyncedRef.current = false
			pendingSyncRef.current = null
			reset()
		}
	}, [open, reset])

	// Monitor for errors that indicate transaction was rejected
	useEffect(() => {
		if (error) {
			if (error.message?.includes('rejected') || error.message?.includes('denied') || error.message?.includes('User rejected')) {
				toast({
					title: 'Transaction Rejected',
					description: 'Transaction was rejected. Please try again.',
					variant: 'destructive',
				})
			}
		}
	}, [error, toast])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						Create Project
					</Button>
				)}
			</DialogTrigger>
				<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Project</DialogTitle>
					<DialogDescription>
						Create a new sustainability project on the blockchain. This will require a transaction.
					</DialogDescription>
					{chainId !== SUPPORTED_NETWORK.BASE_SEPOLIA && (
						<div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
							<p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
								⚠️ Wrong Network Detected
							</p>
							<p className="text-xs text-yellow-600 dark:text-yellow-400 mb-3">
								You're currently on chain ID <strong>{chainId}</strong>. 
								Please switch to <strong>{NETWORK_NAME} ({SUPPORTED_NETWORK.BASE_SEPOLIA})</strong> to create projects.
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="w-full"
								onClick={async () => {
									try {
										await switchChain({ chainId: SUPPORTED_NETWORK.BASE_SEPOLIA })
										toast({
											title: 'Switching Network',
											description: 'Please confirm the network switch in your wallet',
										})
									} catch (err: unknown) {
										// If switch fails (chain not added), try to add it first
										const error = err as { code?: number; message?: string }
										if (error?.code === 4902 || error?.message?.includes('not added')) {
											try {
												// Add Base Sepolia to wallet using viem's addChain
												if (client) {
													await addChain(client, { chain: baseSepolia })
													// Then switch to it
													await switchChain({ chainId: SUPPORTED_NETWORK.BASE_SEPOLIA })
												} else {
													throw new Error('Wallet not connected')
												}
												toast({
													title: 'Network Added',
													description: 'Base Sepolia has been added to your wallet. Please confirm the switch.',
												})
											} catch (addErr) {
												toast({
													title: 'Network Switch Failed',
													description: 'Please manually add Base Sepolia to your wallet and try again.',
													variant: 'destructive',
												})
											}
										} else {
											toast({
												title: 'Network Switch Failed',
												description: `Please manually switch to ${NETWORK_NAME} in your wallet`,
												variant: 'destructive',
											})
										}
									}
								}}
							>
								Switch to {NETWORK_NAME}
							</Button>
						</div>
					)}
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Project Name *</Label>
						<Input
							id="name"
							placeholder="e.g., Community Tree Planting Initiative"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							placeholder="Describe your sustainability project..."
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							rows={4}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fundingGoal">Funding Goal (ETH) *</Label>
						<Input
							id="fundingGoal"
							type="number"
							step="0.001"
							min="0.001"
							placeholder="e.g., 10"
							value={formData.fundingGoal}
							onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Minimum funding goal: 0.001 ETH
						</p>
					</div>

					{(error || isReceiptError) && (
						<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
							<p className="font-semibold">Transaction Error:</p>
							<p>{error instanceof Error ? error.message : isReceiptError ? 'Transaction failed' : 'Transaction failed'}</p>
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
							{isPending ? 'Confirm in Wallet...' : isConfirming ? 'Creating...' : 'Create Project'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

