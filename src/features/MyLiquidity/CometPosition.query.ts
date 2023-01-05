import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getMantissa, toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

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


  const [tokenDataResult, singlePoolCometResult] = await Promise.allSettled([
    program.getTokenData(), program.getSinglePoolComets()
  ]);

  if (tokenDataResult.status !== "fulfilled" || singlePoolCometResult.status !== "fulfilled") return null;
  const comet = singlePoolCometResult.value;
  const tokenData = tokenDataResult.value;
  const position = comet.positions[index];

  console.log('comet', comet)
  console.log('comet-poolIndex', Number(position.poolIndex))

  const mintAmount = toNumber(position.borrowedUsdi)
  const mintIassetAmount = toNumber(position.borrowedIasset)
  const collAmount = toNumber(comet.collaterals[index].collateralAmount)

  let price = 0
  let tightRange = 0
  let maxRange = 0
  let centerPrice = 0
  let tickerIcon = ''
  let tickerName = ''
  let tickerSymbol = ''
  let ild = 0
  let healthScore = 0
  let lowerLimit = 0
  let upperLimit = 0

  if (Number(position.poolIndex) < 255) {
    let pool = tokenData.pools[position.poolIndex];
    const balances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
    price = balances[1] / balances[0]
    tightRange = price * 0.1
    maxRange = 2 * price
    centerPrice = getMantissa(position.borrowedIasset) === 0 ? 0 : getMantissa(position.borrowedUsdi) / getMantissa(position.borrowedIasset)

    const asset = assetMapping(Number(position.poolIndex))
    tickerIcon = asset.tickerIcon
    tickerName = asset.tickerName
    tickerSymbol = asset.tickerSymbol
    const singlePoolHealthScore = program.getSinglePoolHealthScore(index, tokenData, comet);
    ild = singlePoolHealthScore.ILD
    healthScore = singlePoolHealthScore.healthScore

    const {
      lowerPrice,
      upperPrice
    } = program.calculateNewSinglePoolCometFromUsdiBorrowed(
      Number(position.poolIndex),
      collAmount,
      mintAmount,
      tokenData
    )
    console.log('fdd', upperPrice);
    lowerLimit = lowerPrice
    upperLimit = upperPrice
  }

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
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
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