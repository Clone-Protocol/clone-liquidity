import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const fetchStatus = async ({ program, userPubKey, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return null

  console.log('fetchStatus')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadManager()

  let totalVal = 0
  let borrow = 0
  let unconcentrated = 0
  let comet = 0
  let multipoolComet = 0
  let liquidated = 0

  const [mintPositionsResult, singlePoolCometsResult, liquidityPositionsResult, cometsResult] = await Promise.allSettled([
    program.getMintPositions(),
    program.getSinglePoolComets(),
    program.getLiquidityPositions(),
    program.getComet()
  ]);

  if (mintPositionsResult.status === "fulfilled") {
    const mintPositions = mintPositionsResult.value;
    for (var i = 0; i < Number(mintPositions.numPositions); i++) {
      let mintPosition = mintPositions.mintPositions[i]
      let collateralAmount = toNumber(mintPosition.collateralAmount)
      totalVal += collateralAmount
      borrow += collateralAmount
    }
  }

  if (liquidityPositionsResult.status === "fulfilled") {
    const liquidityPositions = liquidityPositionsResult.value;
    const tokenData = await program.getTokenData();
    for (var i = 0; i < Number(liquidityPositions.numPositions); i++) {
      let liquidityPosition = liquidityPositions.liquidityPositions[i]
      let liquidityTokenAmount = toNumber(liquidityPosition.liquidityTokenValue)
      let poolIndex = liquidityPosition.poolIndex
      let pool = tokenData.pools[poolIndex];//await program.getPool(poolIndex)
      let liquidityTokenSupply = toNumber(pool.liquidityTokenSupply);//(await program.connection.getTokenSupply(pool.liquidityTokenMint, "processed"))
      // .value!.uiAmount
      let balances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];//await program.getPoolBalances(poolIndex)
      let amount = ((balances[1] * liquidityTokenAmount) / liquidityTokenSupply) * 2
      totalVal += amount
      unconcentrated += amount
    }
  }

  if (singlePoolCometsResult.status === "fulfilled") {
    const comets = singlePoolCometsResult.value;
    for (let i = 0; i < Number(comets.numCollaterals.toNumber()); i++) {
      let collateralAmount = toNumber(comets.collaterals[i].collateralAmount);
      totalVal += collateralAmount;
      comet += collateralAmount;
    }
  }

  if (cometsResult.status === "fulfilled") {
    const comets = cometsResult.value
    // Only take usdi value for now.
    let usdiValue = toNumber(comets.collaterals[0].collateralAmount)
    totalVal += usdiValue
    multipoolComet += usdiValue
  }

  let borrowPercent = totalVal > 0 ? (borrow / totalVal) * 100 : 0
  let unconcentratedPercent = totalVal > 0 ? (unconcentrated / totalVal) * 100 : 0
  let cometPercent = totalVal > 0 ? (comet / totalVal) * 100 : 0

  const statusValues = {
    totalCometLiquidity: 1535356.02,
    totalCometValLocked: 1535356.02,
    totalUnconcentPositionVal: 1535356.02,
    totalBorrowLiquidity: 1535356.02,
    totalBorrowCollateralVal: 535356.02,
  }

  return {
    totalVal,
    comet,
    cometPercent,
    unconcentrated,
    unconcentratedPercent,
    borrow,
    borrowPercent,
    multipoolComet,
    liquidated,
    statusValues
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

interface StatusValues {
  totalCometLiquidity: number
  totalCometValLocked: number
  totalUnconcentPositionVal: number
  totalBorrowLiquidity: number
  totalBorrowCollateralVal: number
}

export interface Status {
  totalVal: number
  comet: number
  cometPercent: number
  unconcentrated: number
  unconcentratedPercent: number
  borrow: number
  borrowPercent: number
  multipoolComet: number
  liquidated: number
  statusValues: StatusValues
}

export function useStatusQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(['statusData', userPubKey], () => fetchStatus({ program: getInceptApp(), userPubKey, setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}