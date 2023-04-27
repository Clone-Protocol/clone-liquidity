import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { getAccount } from '@solana/spl-token'
import { DEVNET_TOKEN_SCALE, InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { getSinglePoolHealthScore, calculateEditCometSinglePoolWithUsdiBorrowed, getSinglePoolILD } from "incept-protocol-sdk/sdk/src/healthscore"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getMantissa, toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { getTokenAccount } from '~/utils/token_accounts'

export const fetchInitializeCometDetail = async ({ program, userPubKey, index }: { program: InceptClient, userPubKey: PublicKey | null, index: number }) => {
  if (!userPubKey) return

  await program.loadManager()

  const tokenData = await program.getTokenData();
  const pool = tokenData.pools[index];
  //const balances = await program.getPoolBalances(index)
  let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
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

export const fetchCometDetail = async ({ program, userPubKey, index, setStartTimer }: { program: InceptClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return

  // console.log('fetchCometDetail', index)
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

  // console.log('comet', comet)
  // console.log('comet-poolIndex', Number(position.poolIndex))

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
  let ildInUsdi = false
  let ild = 0
  let healthScore = 0
  let lowerLimit = 0
  let upperLimit = 0
  let pythSymbol = ''
  let iassetBalance = 0

  if (Number(position.poolIndex) < 255) {
    let pool = tokenData.pools[position.poolIndex];
    const balances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
    price = balances[1] / balances[0]
    tightRange = price * 0.1
    maxRange = 2 * price
    centerPrice = getMantissa(position.borrowedIasset) === 0 ? 0 : getMantissa(position.borrowedUsdi) / getMantissa(position.borrowedIasset)

    const asset = assetMapping(Number(position.poolIndex))
    pythSymbol = asset.pythSymbol
    tickerIcon = asset.tickerIcon
    tickerName = asset.tickerName
    tickerSymbol = asset.tickerSymbol
    const singlePoolHealthScore = getSinglePoolHealthScore(index, tokenData, comet);
    const ILDinfo = getSinglePoolILD(index, tokenData, comet)
    ildInUsdi = ILDinfo.usdiILD > 0;
    ild = ildInUsdi ? ILDinfo.usdiILD : ILDinfo.iAssetILD
    healthScore = singlePoolHealthScore.healthScore
    const iassetAccountAddress = await getTokenAccount(pool.assetInfo.iassetMint, program.provider.publicKey!, program.provider.connection)
    if (iassetAccountAddress !== undefined) {
      const iassetTokenAccount = await getAccount(program.provider.connection, iassetAccountAddress)
      iassetBalance = Number(iassetTokenAccount.amount) * (10 ** -DEVNET_TOKEN_SCALE)
    }

    const {
      lowerPrice,
      upperPrice
    } = calculateEditCometSinglePoolWithUsdiBorrowed(
      tokenData,
      comet,
      index,
      0,
      0
    )
    lowerLimit = lowerPrice
    upperLimit = upperPrice
  }

  const contributedLiquidity = toNumber(position.borrowedUsdi) * 2

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
  const { getInceptApp } = useIncept()
  if (wallet) {
    return useQuery(['initComet', wallet, userPubKey, index], () => fetchInitializeCometDetail({ program: getInceptApp(wallet), userPubKey, index }), {
      refetchOnMount,
      enabled
    })
  } else {
    return useQuery(['initComet'], () => { })
  }
}

export function useCometDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['cometDetail', wallet, userPubKey, index], () => fetchCometDetail({ program: getInceptApp(wallet), userPubKey, index, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['cometDetail'], () => { })
  }

}