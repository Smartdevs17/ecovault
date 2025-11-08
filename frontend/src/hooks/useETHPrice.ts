/**
 * Hook to fetch current ETH price in USD
 * Uses CoinGecko API (free, no API key required)
 */

import { useQuery } from '@tanstack/react-query'

interface CoinGeckoResponse {
	ethereum: {
		usd: number
	}
}

const fetchETHPrice = async (): Promise<number> => {
	try {
		const response = await fetch(
			'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
		)
		if (!response.ok) {
			throw new Error('Failed to fetch ETH price')
		}
		const data: CoinGeckoResponse = await response.json()
		return data.ethereum.usd
	} catch (error) {
		return 3000
	}
}

export function useETHPrice() {
	return useQuery({
		queryKey: ['ethPrice'],
		queryFn: fetchETHPrice,
		staleTime: 60000, // Consider data fresh for 1 minute
		refetchInterval: 300000, // Refetch every 5 minutes
		retry: 2,
	})
}

