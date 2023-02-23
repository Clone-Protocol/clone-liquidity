import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchStatus = async ({ program, userPubKey, setStartTimer }: { program: InceptClient, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
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
  let totalCometLiquidity = 0;
  let totalCometValLocked = 0;
  let totalUnconcentPositionVal = 0;
  let totalBorrowLiquidity = 0;
  let totalBorrowCollateralVal = 0;

  const [tokenDataResult, borrowPositionsResult, singlePoolCometsResult, liquidityPositionsResult, cometsResult] = await Promise.allSettled([
    program.getTokenData(),
    program.getBorrowPositions(),
    program.getSinglePoolComets(),
    program.getLiquidityPositions(),
    program.getComet()
  ]);
  
  if (tokenDataResult.status === "rejected") {
    throw new Error("couldn't fetch token data!")
  }
  let tokenData = tokenDataResult.value!;

  if (borrowPositionsResult.status === "fulfilled") {
    const borrowPositions = borrowPositionsResult.value;
    for (var i = 0; i < Number(borrowPositions.numPositions); i++) {
      let borrowPosition = borrowPositions.borrowPositions[i]
      let collateralAmount = toNumber(borrowPosition.collateralAmount)
      totalVal += collateralAmount
      borrow += collateralAmount
      totalBorrowCollateralVal += collateralAmount
      let pool = tokenData.pools[borrowPosition.poolIndex];
      totalBorrowLiquidity += toNumber(borrowPosition.borrowedIasset) * toNumber(pool.assetInfo.price);
    }
  }

  if (liquidityPositionsResult.status === "fulfilled") {
    const liquidityPositions = liquidityPositionsResult.value;
    const tokenData = await program.getTokenData();
    for (var i = 0; i < liquidityPositions.length; i++) {
      let position = liquidityPositions[i];
      let liquidityTokenAmount = position.liquidityTokens;
      let pool = tokenData.pools[position.poolIndex];
      let liquidityTokenSupply = toNumber(pool.liquidityTokenSupply);
      let amount = ((toNumber(pool.usdiAmount) * liquidityTokenAmount) / liquidityTokenSupply) * 2
      totalVal += amount
      unconcentrated += amount
      totalUnconcentPositionVal += amount;
    }
  }

  if (singlePoolCometsResult.status === "fulfilled") {
    const comets = singlePoolCometsResult.value;
    for (let i = 0; i < Number(comets.numCollaterals.toNumber()); i++) {
      let collateralAmount = toNumber(comets.collaterals[i].collateralAmount);
      totalVal += collateralAmount;
      comet += collateralAmount;
      totalCometValLocked += collateralAmount;
    }

    comets.positions.slice(0, comets.numPositions.toNumber()).forEach((pos) => {
      totalCometLiquidity += toNumber(pos.borrowedUsdi) * 2;
    });
  }

  if (cometsResult.status === "fulfilled") {
    const comets = cometsResult.value
    // Only take usdi value for now.
    let usdiValue = toNumber(comets.collaterals[0].collateralAmount)
    totalCometValLocked += usdiValue;
    totalVal += usdiValue
    multipoolComet += usdiValue

    comets.positions.slice(0, comets.numPositions.toNumber()).forEach((pos) => {
      totalCometLiquidity += toNumber(pos.borrowedUsdi) * 2;
    });
  }

  let borrowPercent = totalVal > 0 ? (borrow / totalVal) * 100 : 0
  let unconcentratedPercent = totalVal > 0 ? (unconcentrated / totalVal) * 100 : 0
  let cometPercent = totalVal > 0 ? (comet / totalVal) * 100 : 0

  const statusValues = {
    totalCometLiquidity,
    totalCometValLocked,
    totalUnconcentPositionVal,
    totalBorrowLiquidity,
    totalBorrowCollateralVal,
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
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['statusData', wallet, userPubKey], () => fetchStatus({ program: getInceptApp(wallet), userPubKey, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['statusData'], () => { })
  }
}