import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept, Comet } from "incept-protocol-sdk/sdk/src/incept"
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

  try {
    let mintPositions = await program.getMintPositions()
    let liquidityPositions = await program.getLiquidityPositions()
    let comets = await program.getSinglePoolComets()

    for (var i = 0; i < Number(mintPositions.numPositions); i++) {
      let mintPosition = mintPositions.mintPositions[i]
      let collateralAmount = toNumber(mintPosition.collateralAmount)
      totalVal += collateralAmount
      borrow += collateralAmount
    }

    for (var i = 0; i < Number(liquidityPositions.numPositions); i++) {
      let liquidityPosition = liquidityPositions.liquidityPositions[i]
      let liquidityTokenAmount = toNumber(liquidityPosition.liquidityTokenValue)
      let poolIndex = liquidityPosition.poolIndex
      let pool = await program.getPool(poolIndex)
      let liquidityTokenSupply = (await program.connection.getTokenSupply(pool.liquidityTokenMint, "processed"))
        .value!.uiAmount
      let balances = await program.getPoolBalances(poolIndex)
      let amount = ((balances[1] * liquidityTokenAmount) / liquidityTokenSupply!) * 2
      totalVal += amount
      unconcentrated += amount
    }

    comets.collaterals.slice(0, comets.numCollaterals.toNumber()).forEach(collateral => {
      let collateralAmount = toNumber(collateral.collateralAmount);
      totalVal += collateralAmount;
      comet += collateralAmount;
    });

  } catch (e) {
    console.error(e)
  }

	let borrowPercent = totalVal > 0 ? (borrow / totalVal) * 100 : 0
	let unconcentratedPercent = totalVal > 0 ? (unconcentrated / totalVal) * 100 : 0
	let cometPercent = totalVal > 0 ? (comet / totalVal) * 100 : 0

  // TODO:
  let multipoolComet = 0
  let liquidated = 0

	return {
		totalVal,
		comet,
		cometPercent,
		unconcentrated,
		unconcentratedPercent,
		borrow,
		borrowPercent,
    multipoolComet,
    liquidated
	}
}

interface GetProps {
	userPubKey: PublicKey | null
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
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