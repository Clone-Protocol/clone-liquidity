import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchBorrowDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

  console.log('fetchBorrowDetail', index)

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

const fetchBorrowPosition = async ({ program, userPubKey, index, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return

  console.log('fetchBorrowPosition')

  await program.loadManager()

  let mint = await program.getMintPosition(index)
  const poolIndex = Number(mint.poolIndex)
  
	const data = await program.getMintiAssetData(poolIndex)
  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(poolIndex)

  const positionData = await program.getUserMintInfo(poolIndex)

  const balance = await fetchBalance({
    program,
    userPubKey,
    index: poolIndex,
    setStartTimer
  })
  
  return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		oPrice: data[0]!,
		stableCollateralRatio: data[1]!,
		cryptoCollateralRatio: data[2]!,
    borrowedIasset: positionData![0],
    collateralAmount: positionData![1],
    collateralRatio: positionData![2],
    minCollateralRatio: positionData![3],
    usdiVal: balance?.usdiVal,
    iassetVal: balance?.iassetVal
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
	tickerSymbol: string
	oPrice: number
	stableCollateralRatio: number
	cryptoCollateralRatio: number
	borrowedIasset: number
	collateralAmount: number
	collateralRatio: number
	minCollateralRatio: number
  usdiVal: number
  iassetVal: number
}

export interface PairData {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
}

export function useBorrowDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['borrowDetail', userPubKey, index], () => fetchBorrowDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}

export function useBorrowPositionQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(['borrowPosition', userPubKey, index], () => fetchBorrowPosition({ program: getInceptApp(), userPubKey, index, setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}