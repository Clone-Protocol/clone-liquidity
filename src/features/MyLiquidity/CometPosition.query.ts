import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toScaledNumber } from 'incept-protocol-sdk/sdk/src/utils'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchInitializeCometDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()

	const balances = await program.getPoolBalances(index)
	let price = balances[1] / balances[0]
	let tightRange = price * 0.1
	let maxRange = 2 * price
	let centerPrice = price

  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)
	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		tightRange,
		maxRange,
		centerPrice,
	}
}

export const fetchCometDetail = async ({ program, userPubKey, index, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
	if (!userPubKey) return

  console.log('fetchCometDetail', index)
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()

  const comet = await program.getSinglePoolComet(index);
  const position = comet.positions[0];

  console.log('comet', comet)
  console.log('comet-poolIndex', Number(position.poolIndex))
	const balances = await program.getPoolBalances(Number(position.poolIndex))
	let price = balances[1] / balances[0]
	let tightRange = price * 0.1
	let maxRange = 2 * price
	let centerPrice = Number(position.borrowedIasset.val) === 0 ? 0 : Number(position.borrowedUsdi.val) / Number(position.borrowedIasset.val)

  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(Number(position.poolIndex))
  const mintAmount = toScaledNumber(position.borrowedUsdi)
  const mintIassetAmount = toScaledNumber(position.borrowedIasset)
  const collAmount = toScaledNumber(comet.totalCollateralAmount)
  const [ lLimit, hLimit] = await program.calculateRangeFromUSDiAndCollateral(
    0, // USDi
    Number(position.poolIndex),
    collAmount,
    mintAmount
  )
  const lowerLimit = lLimit;
  const upperLimit = hLimit;
  const singlePoolHealthScore =  await program.getSinglePoolHealthScore(index)
  const ild = singlePoolHealthScore.ILD
  const healthScore = singlePoolHealthScore.healthScore

	return {
    mintAmount,
    mintIassetAmount,
    collAmount,
    lowerLimit,
    upperLimit,
    ild,
    healthScore,
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		tightRange,
		maxRange,
		centerPrice
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface PositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string | null
	price: number
	tightRange: number
	maxRange: number
	centerPrice: number
}

export interface CometInfo {
  isTight: boolean
	lowerLimit: number
  upperLimit: number
}

export interface CometDetail extends PositionInfo {
  mintAmount: number
  mintIassetAmount?: number
  collAmount: number
  lowerLimit: number
  upperLimit: number
  ild: number
  healthScore: number
}

export function useInitCometDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['initComet', userPubKey, index], () => fetchInitializeCometDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}

export function useCometDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(['cometDetail', userPubKey, index], () => fetchCometDetail({ program: getInceptApp(), userPubKey, index, setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}