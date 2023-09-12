import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient, fromScale } from "clone-protocol-sdk/sdk/src/clone"
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

  const pools = await program.getPools()
  const oracles = await program.getOracles();
  const pool = pools.pools[index]
  const assetInfo = pool.assetInfo
  const oracle = oracles.oracles[Number(assetInfo.oracleInfoIndex)];
  const oPrice = fromScale(oracle.price, oracle.expo)
  const minCollateralRatio = fromScale(assetInfo.minOvercollateralRatio, 2) * 100;
  const { tickerIcon, tickerName, tickerSymbol, pythSymbol } = assetMapping(index)

  return {
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    oPrice,
    minCollateralRatio,
  }
}

export interface DetailInfo {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
  pythSymbol: string
  oPrice: number
  minCollateralRatio: number
}

const fetchBorrowPosition = async ({ program, userPubKey, index, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return

  console.log('fetchBorrowPosition')

  const [poolsData, oraclesData, userAccountData] = await Promise.allSettled([
    program.getPools(), program.getOracles(), program.getUserAccount()
  ]);

  if (poolsData.status !== "fulfilled" || oraclesData.status !== "fulfilled" || userAccountData.status !== "fulfilled") return

  const borrowPositions = userAccountData.value.borrows
  const mint = borrowPositions[index];
  const poolIndex = Number(mint.poolIndex)

  const { tickerIcon, tickerName, tickerSymbol, pythSymbol } = assetMapping(poolIndex)
  const pools = poolsData.value
  const pool = pools.pools[poolIndex]
  const oracles = oraclesData.value
  const oracle = oracles.oracles[Number(pool.assetInfo.oracleInfoIndex)];
  const oraclePrice = fromScale(oracle.price, oracle.expo)
  const positionsData = getUserMintInfos(program, pools, oracles, borrowPositions);
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
    borrowedOnasset: positionData![3],
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
  borrowedOnasset: number | Number
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
    return useQuery(['borrowDetail', userPubKey, index], async () => fetchBorrowDetail({ program: await getCloneApp(wallet), userPubKey, index }), {
      refetchOnMount,
      enabled
    })
  } else {
    return useQuery(['borrowDetail'], () => { return null })
  }
}

export function useBorrowPositionQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['borrowPosition', userPubKey, index], async () => fetchBorrowPosition({ program: await getCloneApp(wallet), userPubKey, index, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['borrowPosition'], () => { return null })
  }
}