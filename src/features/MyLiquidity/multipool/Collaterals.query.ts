import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUSDiAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'

export const fetchCollaterals = async ({
	program,
	userPubKey,
	setStartTimer,
}: {
	program: InceptClient
	userPubKey: PublicKey | null
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return []

	console.log('fetchPools :: Collaterals.query')
	// start timer in data-loading-indicator
	setStartTimer(false)
	setStartTimer(true)

	let usdiBalance = 0
	await program.loadManager()
	let usdiTokenAccount = await getUSDiAccount(program)

	if (usdiTokenAccount !== undefined) {
		let usdiTokenBalance = await program.connection.getTokenAccountBalance(usdiTokenAccount!)
		usdiBalance = usdiTokenBalance.value.uiAmount!
	}

	const onUSDInfo = collateralMapping(StableCollateral.onUSD)
	const result: CollateralList[] = [
		{
			id: 0,
			tickerName: onUSDInfo.collateralName,
			tickerSymbol: onUSDInfo.collateralSymbol,
			tickerIcon: onUSDInfo.collateralIcon,
			balance: usdiBalance,
			isEnabled: true,
		},
	]
	return result
}

interface GetProps {
	userPubKey: PublicKey | null
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export interface CollateralList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	balance: number
	isEnabled: boolean
}

export function useCollateralsQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	if (wallet) {
		return useQuery(
			['collaterals', wallet, userPubKey],
			() => fetchCollaterals({ program: getInceptApp(wallet), userPubKey, setStartTimer }),
			{
				refetchOnMount,
				refetchInterval: REFETCH_CYCLE,
				refetchIntervalInBackground: true,
				enabled,
			}
		)
	} else {
		return useQuery(['collaterals'], () => [])
	}
}
