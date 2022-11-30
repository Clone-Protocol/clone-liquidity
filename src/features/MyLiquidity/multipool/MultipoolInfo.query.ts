import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getiAssetInfos } from '~/utils/assets'
import { assetMapping } from '~/data/assets'

export const fetchInfos = async ({
	program,
	userPubKey,
	setStartTimer,
}: {
	program: Incept
	userPubKey: PublicKey | null
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return

	await program.loadManager()

	console.log('fetchInfos :: MultipoolInfo.query')
	// start timer in data-loading-indicator
	setStartTimer(false)
	setStartTimer(true)

  let healthScore = 70
  let totalCollValue = 90094.95
  let totalLiquidity = 50094.95
  let collAmount = 1005.04
  let collAmountDollarPrice = 1 * collAmount
  let collaterals: Collateral[] = [
    {
      tickerIcon : '/images/assets/USDi.png',
	    tickerSymbol : 'USDi',
	    tickerName : 'USDi',
      collAmount,
      collAmountDollarPrice
    }
  ]
  let positions: LiquidityPosition[] = [
    {
      tickerIcon: '/images/assets/solana.png',
      tickerName: 'iSOL',
      tickerSymbol: 'iSOL',
      liquidityDollarPrice: 1005.04
    }
  ]

	let result = {
    healthScore,
    totalCollValue,
    totalLiquidity,
    collaterals,
    positions
  }

	return result
}

interface GetPoolsProps {
	userPubKey: PublicKey | null
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export interface Collateral {
	tickerSymbol: string
	tickerIcon: string
	tickerName: string
	collAmount: number
	collAmountDollarPrice: number
}

export interface LiquidityPosition {
  tickerSymbol: string
	tickerIcon: string
	tickerName: string
  liquidityDollarPrice: number
}

export function useMultipoolInfoQuery({ userPubKey, refetchOnMount, enabled = true }: GetPoolsProps) {
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	return useQuery(
		['multipoolInfos', userPubKey],
		() => fetchInfos({ program: getInceptApp(), userPubKey, setStartTimer }),
		{
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled,
		}
	)
}
