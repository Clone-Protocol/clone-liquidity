import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { getAccount } from '@solana/spl-token'
import { DEVNET_TOKEN_SCALE, CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { getILD, getHealthScore } from "incept-protocol-sdk/sdk/src/healthscore"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getMantissa, toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { getTokenAccount } from '~/utils/token_accounts'
import { calculatePoolAmounts } from 'incept-protocol-sdk/sdk/src/utils'

export const fetchInitializeCometDetail = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
  if (!userPubKey) return

  await program.loadClone()

  const tokenData = await program.getTokenData();
  const pool = tokenData.pools[index];
  const {poolOnasset, poolOnusd} = calculatePoolAmounts(
    toNumber(pool.onusdIld), toNumber(pool.onassetIld), toNumber(pool.committedOnusdLiquidity), toNumber(pool.assetInfo.price)
  )
  let price = poolOnusd / poolOnasset
  let tightRange = price * 0.1
  let maxRange = 2 * price
  let centerPrice = price

  const { tickerIcon, tickerName, tickerSymbol, pythSymbol } = assetMapping(index)
  return {
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    price,
    tightRange,
    maxRange,
    centerPrice,
  }
}

export const fetchCometDetail = async ({ program, userPubKey, index, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return

  // console.log('fetchCometDetail', index)
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadClone()

  const tokenData = await program.getTokenData()
  const comet = await program.getComet()
  const position = comet.positions[index];
  const pool = tokenData.pools[position.poolIndex]

  // console.log('comet', comet)
  // console.log('comet-poolIndex', Number(position.poolIndex))
  const oraclePrice = toNumber(pool.assetInfo.price)
  const mintAmount = toNumber(position.committedOnusdLiquidity)
  const mintIassetAmount = mintAmount / oraclePrice
  const collAmount = toNumber(comet.collaterals[index].collateralAmount)
  const {poolOnasset, poolOnusd} = calculatePoolAmounts(
    toNumber(pool.onusdIld), toNumber(pool.onassetIld), toNumber(pool.committedOnusdLiquidity), oraclePrice
  )

  let price = 0
  let tightRange = 0
  let maxRange = 0
  let centerPrice = 0
  let tickerIcon = ''
  let tickerName = ''
  let tickerSymbol = ''
  let ildInUsdi = false
  let ild = 0
  let healthScore = 0
  let lowerLimit = 0
  let upperLimit = 0
  let pythSymbol = ''
  let iassetBalance = 0

  if (Number(position.poolIndex) < 255) {
    let pool = tokenData.pools[position.poolIndex];
    price = poolOnusd / poolOnasset
    tightRange = price * 0.1
    maxRange = 2 * price
    centerPrice = price

    const asset = assetMapping(Number(position.poolIndex))
    pythSymbol = asset.pythSymbol
    tickerIcon = asset.tickerIcon
    tickerName = asset.tickerName
    tickerSymbol = asset.tickerSymbol
    const singlePoolHealthScore = getHealthScore(tokenData, comet);
    const ILDinfo = getILD(tokenData, comet)[index]
    ildInUsdi = ILDinfo.onusdILD > 0;
    ild = ildInUsdi ? ILDinfo.onusdILD : ILDinfo.onAssetILD
    healthScore = singlePoolHealthScore.healthScore
    const iassetAccountAddress = await getTokenAccount(pool.assetInfo.onassetMint, program.provider.publicKey!, program.provider.connection)
    if (iassetAccountAddress !== undefined) {
      const iassetTokenAccount = await getAccount(program.provider.connection, iassetAccountAddress)
      iassetBalance = Number(iassetTokenAccount.amount) * (10 ** -DEVNET_TOKEN_SCALE)
    }
  }

  const contributedLiquidity = toNumber(position.committedOnusdLiquidity) * 2

  return {
    mintAmount,
    mintIassetAmount,
    collAmount,
    lowerLimit,
    upperLimit,
    ildInUsdi,
    ild,
    healthScore,
    tickerIcon: tickerIcon,
    tickerName: tickerName,
    tickerSymbol: tickerSymbol,
    pythSymbol,
    price,
    tightRange,
    maxRange,
    centerPrice,
    contributedLiquidity,
    iassetBalance
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  index: number
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface TickerType {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
}

export interface PositionInfo {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string | null
  pythSymbol: string
  price: number
  tightRange?: number
  maxRange?: number
  centerPrice?: number
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
  ildInUsdi: boolean
  ild: number
  healthScore: number
  contributedLiquidity?: number
  iassetBalance: number
}

export function useInitCometDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useIncept()
  if (wallet) {
    return useQuery(['initComet', wallet, userPubKey, index], () => fetchInitializeCometDetail({ program: getCloneApp(wallet), userPubKey, index }), {
      refetchOnMount,
      enabled
    })
  } else {
    return useQuery(['initComet'], () => { })
  }
}

export function useCometDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['cometDetail', wallet, userPubKey, index], () => fetchCometDetail({ program: getCloneApp(wallet), userPubKey, index, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['cometDetail'], () => { })
  }

}