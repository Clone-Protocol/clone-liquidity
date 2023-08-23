import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient, fromCloneScale } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { fromScale } from 'clone-protocol-sdk/sdk/src/clone'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchStatus = async ({ program, userPubKey }: { program: CloneClient, userPubKey: PublicKey | null }) => {
  if (!userPubKey) return null

  console.log('fetchStatus')

  let totalCometLiquidity = 0;
  let totalCometValLocked = 0;
  let totalBorrowLiquidity = 0;
  let totalBorrowCollateralVal = 0;

  const [poolsData, oraclesData, borrowPositionsResult, cometsResult] = await Promise.allSettled([
    program.getPools(),
    program.getOracles(),
    program.getBorrowPositions(),
    program.getComet()
  ]);

  if (poolsData.status === "rejected" || oraclesData.status === "rejected") {
    throw new Error("couldn't fetch token data!")
  }
  let pools = poolsData.value!;

  if (borrowPositionsResult.status === "fulfilled") {
    const borrowPositions = borrowPositionsResult.value;
    for (var i = 0; i < Number(borrowPositions.numPositions); i++) {
      let borrowPosition = borrowPositions.borrowPositions[i]
      let collateral = pools.collaterals[Number(borrowPosition.collateralIndex)];
      let collateralAmount = fromScale(borrowPosition.collateralAmount, collateral.scale)
      totalBorrowCollateralVal += collateralAmount
      let pool = pools.pools[borrowPosition.poolIndex];
      const oracle = oraclesData.value.oracles[Number(pool.assetInfo.oracleInfoIndex)];
      totalBorrowLiquidity += fromCloneScale(borrowPosition.borrowedOnasset) * fromScale(oracle.price, oracle.expo);
    }
  }

  if (cometsResult.status === "fulfilled") {
    const comets = cometsResult.value
    // Only take usdi value for now.
    let usdiValue = toNumber(comets.collaterals[0].collateralAmount)
    totalCometValLocked += usdiValue

    comets.positions.slice(0, comets.numPositions.toNumber()).forEach((pos) => {
      totalCometLiquidity += fromCloneScale(pos.committedOnusdLiquidity) * 2
    });
  }

  let totalCollateralLocked = totalBorrowCollateralVal + totalCometValLocked
  let totalLiquidityProvided = totalBorrowLiquidity + totalCometLiquidity
  let borrowPercent = totalCollateralLocked > 0 ? (totalBorrowCollateralVal / totalCollateralLocked) * 100 : 0

  const statusValues = {
    totalBorrowLiquidity,
    totalBorrowCollateralVal,
    totalLiquidityProvided
  }


  return {
    totalCollateralLocked,
    borrow: totalBorrowCollateralVal,
    borrowPercent,
    comet: totalCometValLocked,
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
  totalBorrowLiquidity: number
  totalBorrowCollateralVal: number
  totalLiquidityProvided: number
}

export interface Status {
  totalCollateralLocked: number
  borrow: number
  borrowPercent: number
  comet: number
  liquidated: number
  statusValues: StatusValues
}

export function useStatusQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()

  if (wallet) {
    return useQuery(['statusData', wallet, userPubKey], async () => fetchStatus({ program: await getCloneApp(wallet), userPubKey }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['statusData'], () => { return null })
  }
}