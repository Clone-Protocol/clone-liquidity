import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { assetMapping } from 'src/data/assets'
import { useClone } from '~/hooks/useClone'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUserMintInfos } from '~/utils/user';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export const fetchBorrowDetail = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
  if (!userPubKey) return

  console.log('fetchBorrowDetail', index)

  const tokenData = await program.getTokenData()

  let oPrice = 1
  let stableCollateralRatio = 0
  let cryptoCollateralRatio = 0
  let assetInfo = tokenData.pools[index].assetInfo
  oPrice = toNumber(assetInfo.price);
  stableCollateralRatio = toNumber(assetInfo.stableCollateralRatio) * 100;
  cryptoCollateralRatio = toNumber(assetInfo.cryptoCollateralRatio) * 100;

  const { tickerIcon, tickerName, tickerSymbol, pythSymbol } = assetMapping(index)

  return {
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    oPrice,
    stableCollateralRatio,
    cryptoCollateralRatio,
  }
}

export interface DetailInfo {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
  pythSymbol: string
  oPrice: number
  stableCollateralRatio: number
  cryptoCollateralRatio: number
}

const fetchBorrowPosition = async ({ program, userPubKey, index, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return

  console.log('fetchBorrowPosition')

  const [tokenDataResult, borrowPositionResult] = await Promise.allSettled([
    program.getTokenData(), program.getBorrowPositions()
  ]);

  if (tokenDataResult.status !== "fulfilled" || borrowPositionResult.status !== "fulfilled") return

  let mint = borrowPositionResult.value.borrowPositions[index];
  const poolIndex = Number(mint.poolIndex)

  const { tickerIcon, tickerName, tickerSymbol, pythSymbol } = assetMapping(poolIndex)
  const assetInfo = tokenDataResult.value.pools[poolIndex].assetInfo;
  const oraclePrice = toNumber(assetInfo.price);
  const positionsData = getUserMintInfos(tokenDataResult.value, borrowPositionResult.value);
  const positionData = positionsData[index];

  const balance = await fetchBalance({
    program,
    userPubKey,
    index: poolIndex,
    setStartTimer
  })

  const borrowAmountInIasset = Number(positionData![3]);
  const minCollateralRatio = positionData![6];
  const minCollateralAmount = borrowAmountInIasset * oraclePrice * Number(minCollateralRatio);
  const maxWithdrawableColl = Number(positionData![4]) - minCollateralAmount;

  return {
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    price: oraclePrice,
    stableCollateralRatio: toNumber(assetInfo.stableCollateralRatio),
    cryptoCollateralRatio: toNumber(assetInfo.cryptoCollateralRatio),
    borrowedIasset: positionData![3],
    collateralAmount: positionData![4],
    collateralRatio: Number(positionData![5]) * 100,
    minCollateralRatio: Number(positionData![6]) * 100,
    usdiVal: balance?.onusdVal!,
    iassetVal: balance?.onassetVal!,
    maxWithdrawableColl
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  index: number
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface PositionInfo {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
  pythSymbol?: string
  price: number
  stableCollateralRatio: number
  cryptoCollateralRatio: number
  borrowedIasset: number | Number
  collateralAmount: number | Number
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
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  if (wallet) {
    return useQuery(['borrowDetail', userPubKey, index], () => fetchBorrowDetail({ program: getCloneApp(wallet), userPubKey, index }), {
      refetchOnMount,
      enabled
    })
  } else {
    return useQuery(['borrowDetail'], () => { })
  }
}

export function useBorrowPositionQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['borrowPosition', userPubKey, index], () => fetchBorrowPosition({ program: getCloneApp(wallet), userPubKey, index, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['borrowPosition'], () => { })
  }
}