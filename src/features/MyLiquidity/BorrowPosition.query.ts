import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient, fromScale } from "clone-protocol-sdk/sdk/src/clone"
import { assetMapping } from 'src/data/assets'
import { useClone } from '~/hooks/useClone'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUserMintInfos } from '~/utils/user';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getiAssetInfos } from '~/utils/assets'
import { Status } from 'clone-protocol-sdk/sdk/generated/clone'

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
  const collateralizationRatio = fromScale(program.clone.collateral.collateralizationRatio, 2)
  const status = pool.status

  return {
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    oPrice,
    minCollateralRatio,
    collateralizationRatio,
    status
  }
}

export interface DetailInfo {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
  pythSymbol: string
  oPrice: number
  minCollateralRatio: number
  collateralizationRatio: number
  status: Status
}

const fetchBorrowPosition = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
  if (!userPubKey) return

  console.log('fetchBorrowPosition')

  const [poolsData, oraclesData, userAccountData, assetInfos] = await Promise.allSettled([
    program.getPools(), program.getOracles(), program.getUserAccount(), getiAssetInfos(program.provider.connection, program)
  ]);

  if (poolsData.status !== "fulfilled" || oraclesData.status !== "fulfilled" || userAccountData.status !== "fulfilled" || assetInfos.status !== "fulfilled") return

  const borrowPositions = userAccountData.value.borrows
  const mint = borrowPositions[index];
  const poolIndex = Number(mint.poolIndex)

  const { tickerIcon, tickerName, tickerSymbol, pythSymbol } = assetMapping(poolIndex)
  const pools = poolsData.value

  const oraclePrice = assetInfos.value[poolIndex].oraclePrice

  const positionsData = getUserMintInfos(program, pools, oraclesData.value, borrowPositions);
  const positionData = positionsData[index];

  const balance = await fetchBalance({
    program,
    userPubKey,
    index: poolIndex
  })
  const collateralizationRatio = fromScale(program.clone.collateral.collateralizationRatio, 2)
  const minCollateralAmount = positionData.borrowedOnasset * oraclePrice * positionData.minCollateralRatio / collateralizationRatio;
  const maxWithdrawableColl = positionData.collateralAmount - minCollateralAmount;

  return {
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    price: oraclePrice,
    borrowedOnasset: positionData.borrowedOnasset,
    collateralAmount: positionData.collateralAmount,
    collateralRatio: positionData.collateralRatio * 100,
    minCollateralRatio: positionData.minCollateralRatio * 100,
    usdiVal: balance?.onusdVal!,
    iassetVal: balance?.onassetVal!,
    maxWithdrawableColl,
    effectiveCollateralValue: positionData.effectiveCollateralValue,
    collateralizationRatio,
    status: positionData.status
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
  effectiveCollateralValue: number
  collateralizationRatio: number
  status: Status
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

  if (wallet) {
    return useQuery(['borrowPosition', userPubKey, index], async () => fetchBorrowPosition({ program: await getCloneApp(wallet), userPubKey, index }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['borrowPosition'], () => { return null })
  }
}