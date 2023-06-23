import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchStatus = async ({ program, userPubKey, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return null

  console.log('fetchStatus')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadClone()

  let totalCometLiquidity = 0;
  let totalCometValLocked = 0;
  let totalBorrowLiquidity = 0;
  let totalBorrowCollateralVal = 0;

  const [tokenDataResult, borrowPositionsResult, cometsResult] = await Promise.allSettled([
    program.getTokenData(),
    program.getBorrowPositions(),
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
      totalBorrowLiquidity += toNumber(borrowPosition.borrowedOnasset) * toNumber(pool.assetInfo.price);
    }
  }

  if (cometsResult.status === "fulfilled") {
    const comets = cometsResult.value
    // Only take usdi value for now.
    let usdiValue = toNumber(comets.collaterals[0].collateralAmount)
    totalCometValLocked += usdiValue

    comets.positions.slice(0, comets.numPositions.toNumber()).forEach((pos) => {
      totalCometLiquidity += toNumber(pos.committedOnusdLiquidity) * 2
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
  const { getCloneApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['statusData', wallet, userPubKey], () => fetchStatus({ program: getCloneApp(wallet), userPubKey, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['statusData'], () => { })
  }
}