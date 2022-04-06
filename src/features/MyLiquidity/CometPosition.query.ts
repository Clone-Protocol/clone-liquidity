import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'

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
	let centerPrice = Number(comet.borrowedUsdi.val) / Number(comet.borrowedIasset.val)
  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(Number(comet.poolIndex))

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
  // collAmount: number
	collRatio: number
	// mintAmount: number
	lowerLimit: number
  upperLimit: number
}

export function useInitCometDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['initComet', userPubKey, index], () => fetchInitializeCometDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}