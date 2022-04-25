import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toScaledNumber } from 'sdk/src/utils'

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

export const fetchCometDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()

	let comet = await program.getCometPosition(index)
	const balances = await program.getPoolBalances(comet.poolIndex)
	let price = balances[1] / balances[0]
	let tightRange = price * 0.1
	let maxRange = 2 * price
	let centerPrice = Number(comet.borrowedIasset.val) === 0 ? 0 : Number(comet.borrowedUsdi.val) / Number(comet.borrowedIasset.val)

  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(Number(comet.poolIndex))
  const mintAmount = toScaledNumber(comet.borrowedUsdi)
  const collAmount = toScaledNumber(comet.collateralAmount)
  const lowerLimit = toScaledNumber(comet.lowerPriceRange)
  const upperLimit = toScaledNumber(comet.upperPriceRange)
  const ild = 0

	return {
    mintAmount,
    collAmount,
    lowerLimit,
    upperLimit,
    ild,
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		tightRange,
		maxRange,
		centerPrice,
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
	collRatio: number
	lowerLimit: number
  upperLimit: number
}

export interface CometDetail extends PositionInfo {
  mintAmount: number
  collAmount: number
  lowerLimit: number
  upperLimit: number
  ild: number
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
  return useQuery(['cometDetail', userPubKey, index], () => fetchCometDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}