import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'


export const fetchBorrowDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

  console.log('fetchBorrowDetail', index)

	await program.loadManager()

  let oPrice = 1
  let stableCollateralRatio = 0
  let cryptoCollateralRatio = 0
  let assetInfo = await program.getAssetInfo(index);
  oPrice = toNumber(assetInfo.price);
  stableCollateralRatio = toNumber(assetInfo.stableCollateralRatio) * 100;
  cryptoCollateralRatio = toNumber(assetInfo.cryptoCollateralRatio) * 100;
	
  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)

	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		oPrice,
		stableCollateralRatio,
		cryptoCollateralRatio,
	}
}

const fetchBorrowPosition = async ({ program, userPubKey, index, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return

  console.log('fetchBorrowPosition')

  await program.loadManager()

  let mint = await program.getMintPosition(index)
  const poolIndex = Number(mint.poolIndex)
  
  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(poolIndex)
  const assetInfo = await program.getAssetInfo(poolIndex);
  const oraclePrice = toNumber(assetInfo.price);
  const positionData = await program.getUserMintInfo(index)

  const balance = await fetchBalance({
    program,
    userPubKey,
    index,
    setStartTimer
  })

  // MEMO : calculation of maxWithdrawableCollateral
  // borrow_amount_in_iasset = collateral_amount / (iasset_oracle_price * collateral_ratio)
  // min_collateral_amount = borrow_amount_in_iasset * iasset_oracle_price * minCollateralRatio
  // max_withdrawable_collateral = collateral_amount - min_collateral_amount
  const borrowAmountInIasset = positionData![1] / (oraclePrice * positionData![2]);
  const minCollateralRatio = positionData![3];
  const minCollateralAmount = borrowAmountInIasset * oraclePrice * minCollateralRatio;
  const maxWithdrawableColl = positionData![1] - minCollateralAmount;
  
  return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		oPrice: oraclePrice,
		stableCollateralRatio: toNumber(assetInfo.stableCollateralRatio),
		cryptoCollateralRatio: toNumber(assetInfo.cryptoCollateralRatio),
    borrowedIasset: positionData![0],
    collateralAmount: positionData![1],
    collateralRatio: positionData![2] * 100,
    minCollateralRatio: positionData![3] * 100,
    usdiVal: balance?.usdiVal!,
    iassetVal: balance?.iassetVal!,
    maxWithdrawableColl
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
  maxWithdrawableColl: number
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