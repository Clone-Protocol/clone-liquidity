import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'

export const fetchBorrowDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()
	const data = await program.getMintiAssetData(index)

  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)

	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		oPrice: data[0]!,
		stableCollateralRatio: data[1]!,
		cryptoCollateralRatio: data[2]!,
	}
}

export const fetchPositionDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()

	const data = await program.getUserMintInfo(index)
	return data
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
	tickerSymbol: string
	oPrice: number
	stableCollateralRatio: number
	cryptoCollateralRatio: number
	borrowedIasset: number
	collateralAmount: number
	collateralRatio: number
	minCollateralRatio: number
}

export interface PairData {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	amount: number
}

export function useBorrowDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['borrowDetail', userPubKey, index], () => fetchBorrowDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}

export function usePositionDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['positionDetail', userPubKey, index], () => fetchPositionDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}