import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchMax = async ({ program, userPubKey, index, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
	if (!userPubKey) return null

	console.log('fetchBalance')
	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

	await program.loadClone()

	const tokenData = await program.getTokenData();
	let liquidityPositions = await program.getLiquidityPositions();

	let liquidityPosition = liquidityPositions[index];
	let liquidityTokenBalance = liquidityPosition.liquidityTokens

	let pool = tokenData.pools[liquidityPosition.poolIndex]

	let liquidityTokenSupplyBeforeComet = (
		await program.connection.getTokenSupply(pool.liquidityTokenMint, "processed")
	).value!.uiAmount

	let maxVal = ((toNumber(pool.usdiAmount) * liquidityTokenBalance) / liquidityTokenSupplyBeforeComet!)

	return {
		maxVal: maxVal,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export function useBalanceQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	if (wallet) {
		return useQuery(['unconcentBalance', wallet, userPubKey, index], () => fetchMax({ program: getCloneApp(wallet), userPubKey, index, setStartTimer }), {
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled
		})
	} else {
		return useQuery(['unconcentBalance'], () => ({ maxVal: 0 }))
	}
}