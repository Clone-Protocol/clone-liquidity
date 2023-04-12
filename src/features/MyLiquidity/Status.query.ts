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

  let totalMultiPoolCometLiquidity = 0;
  let totalMultiPoolCometValLocked = 0;
  let totalSinglePoolCometLiquidity = 0;
  let totalSinglePoolCometValLocked = 0;
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
      totalUnconcentPositionVal += amount;
    }
  }

  if (singlePoolCometsResult.status === "fulfilled") {
    const comets = singlePoolCometsResult.value;
    for (let i = 0; i < Number(comets.numCollaterals.toNumber()); i++) {
      let collateralAmount = toNumber(comets.collaterals[i].collateralAmount);
      totalSinglePoolCometValLocked += collateralAmount;
    }

    comets.positions.slice(0, comets.numPositions.toNumber()).forEach((pos) => {
      totalSinglePoolCometLiquidity += toNumber(pos.borrowedUsdi) * 2
    });
  }

  if (cometsResult.status === "fulfilled") {
    const comets = cometsResult.value
    // Only take usdi value for now.
    let usdiValue = toNumber(comets.collaterals[0].collateralAmount)
    totalMultiPoolCometValLocked += usdiValue

    comets.positions.slice(0, comets.numPositions.toNumber()).forEach((pos) => {
      totalMultiPoolCometLiquidity += toNumber(pos.borrowedUsdi) * 2
    });
  }

  let totalCollateralLocked = totalBorrowCollateralVal + totalUnconcentPositionVal + totalMultiPoolCometValLocked + totalSinglePoolCometValLocked
  let totalLiquidityProvided = totalBorrowLiquidity + totalUnconcentPositionVal + totalMultiPoolCometLiquidity + totalSinglePoolCometLiquidity
  let borrowPercent = totalCollateralLocked > 0 ? (totalBorrowCollateralVal / totalCollateralLocked) * 100 : 0
  let unconcentratedPercent = totalCollateralLocked > 0 ? (totalUnconcentPositionVal / totalCollateralLocked) * 100 : 0
  let cometPercent = totalCollateralLocked > 0 ? (totalSinglePoolCometValLocked / totalCollateralLocked) * 100 : 0

  const statusValues = {
    totalSinglePoolCometLiquidity,
    totalSinglePoolCometValLocked,
    totalUnconcentPositionVal,
    totalBorrowLiquidity,
    totalBorrowCollateralVal,
    totalLiquidityProvided
  }


  return {
    totalCollateralLocked,
    comet: totalSinglePoolCometValLocked,
    cometPercent,
    unconcentrated: totalUnconcentPositionVal,
    unconcentratedPercent,
    borrow: totalBorrowCollateralVal,
    borrowPercent,
    multipoolComet: totalMultiPoolCometValLocked,
    liquidated: 0,
    statusValues
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

interface StatusValues {
  totalSinglePoolCometLiquidity: number
  totalSinglePoolCometValLocked: number
  totalUnconcentPositionVal: number
  totalBorrowLiquidity: number
  totalBorrowCollateralVal: number
  totalLiquidityProvided: number
}

export interface Status {
  totalCollateralLocked: number
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