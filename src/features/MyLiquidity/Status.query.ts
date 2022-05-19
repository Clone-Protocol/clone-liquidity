import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { toScaledNumber } from 'incept-protocol-sdk/sdk/src/utils'
import { useIncept } from '~/hooks/useIncept'

export const fetchStatus = async ({ program, userPubKey }: { program: Incept, userPubKey: PublicKey | null }) => {
	if (!userPubKey) return null

  await program.loadManager()
	let mintPositions = await program.getMintPositions()
	let liquidityPositions = await program.getLiquidityPositions()
	let cometPositions = await program.getCometPositions()
	let totalVal = 0
	let borrow = 0
	let unconcentrated = 0
	let comet = 0

	for (var i = 0; i < Number(mintPositions.numPositions); i++) {
		let mintPosition = mintPositions.mintPositions[i]
		let collateralAmount = toScaledNumber(mintPosition.collateralAmount)
		totalVal += collateralAmount
		borrow += collateralAmount
	}

	for (var i = 0; i < Number(liquidityPositions.numPositions); i++) {
		let liquidityPosition = liquidityPositions.liquidityPositions[i]
		let liquidityTokenAmount = toScaledNumber(liquidityPosition.liquidityTokenValue)
		let poolIndex = liquidityPosition.poolIndex
		let pool = await program.getPool(poolIndex)
		let liquidityTokenSupply = (await program.connection.getTokenSupply(pool.liquidityTokenMint, 'confirmed'))
			.value!.uiAmount
		let balances = await program.getPoolBalances(poolIndex)
		let amount = ((balances[1] * liquidityTokenAmount) / liquidityTokenSupply!) * 2
		totalVal += amount
		unconcentrated += amount
	}

	for (var i = 0; i < Number(cometPositions.numPositions); i++) {
		let cometPosition = cometPositions.cometPositions[i]
		let collateralAmount = toScaledNumber(cometPosition.collateralAmount)
		totalVal += collateralAmount
		comet += collateralAmount
	}

	let borrowPercent = (borrow / totalVal) * 100
	let unconcentratedPercent = (unconcentrated / totalVal) * 100
	let cometPercent = (comet / totalVal) * 100

	return {
		totalVal,
		comet,
		cometPercent,
		unconcentrated,
		unconcentratedPercent,
		borrow,
		borrowPercent,
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
}

export function useStatusQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['borrowAssets', userPubKey], () => fetchStatus({ program: getInceptApp(), userPubKey }), {
    refetchOnMount,
    enabled
  })
}