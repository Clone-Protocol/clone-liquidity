import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { BN } from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'

export const callWithdraw = async ({program, userPubKey, data} : CallWithdrawProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  	const { index, amount } = data

	let liquidityPosition = await program.getLiquidityPosition(index)

	let pool = await program.getPool(liquidityPosition.poolIndex)

	let liquidityTokenSupplyBeforeComet = (
		await program.connection.getTokenSupply(pool.liquidityTokenMint, 'confirmed')
	).value!.uiAmount

	let balances = await program.getPoolBalances(liquidityPosition.poolIndex)

	let liquidityTokenAmount = ((amount / 2) * liquidityTokenSupplyBeforeComet!) / balances[1]

	let iassetMint = (await program.getAssetInfo(liquidityPosition.poolIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(liquidityPosition.poolIndex)).liquidityTokenMint

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)
	const liquidityAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(liquidityTokenMint)

	await program.withdrawLiquidity(
		new BN(liquidityTokenAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		liquidityAssociatedTokenAccount.address,
		index,
		[]
	)

	return {
    result: true
  }
}

type WithdrawFormData = {
  index: number
  amount: number
}
interface CallWithdrawProps {
	program: Incept
	userPubKey: PublicKey | null
  data: WithdrawFormData
}
export function useWithdrawMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: WithdrawFormData) => callWithdraw({ program: getInceptApp(), userPubKey, data }))
}


export const callDeposit = async ({program, userPubKey, data} : CallDepositProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const { index, iassetAmount } = data

	let liquidityPosition = await program.getLiquidityPosition(index)

	let iassetMint = (await program.getAssetInfo(liquidityPosition.poolIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(liquidityPosition.poolIndex)).liquidityTokenMint

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)
	const liquidityAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(liquidityTokenMint)

	await program.provideLiquidity(
		new BN(iassetAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		liquidityAssociatedTokenAccount.address,
		index,
		[]
	)

	return {
    result: true
  }
}

type DepositFormData = {
  index: number
  iassetAmount: number
}
interface CallDepositProps {
	program: Incept
	userPubKey: PublicKey | null
  data: DepositFormData
}
export function useDepositMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: DepositFormData) => callDeposit({ program: getInceptApp(), userPubKey, data }))
}


export const callLiquidity = async ({ program, userPubKey, data }: CallLiquidityProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const { iassetIndex, iassetAmount } = data

	let iassetMint = (await program.getAssetInfo(iassetIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(iassetIndex)).liquidityTokenMint

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)
	const liquidityAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(liquidityTokenMint)

	await program.initializeLiquidityPosition(
		new BN(iassetAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		liquidityAssociatedTokenAccount.address,
		iassetIndex,
		[]
	)

	return {
    result: true
  }
}

type LiquidityFormData = {
  iassetIndex: number
	iassetAmount: number
}
interface CallLiquidityProps {
	program: Incept
	userPubKey: PublicKey | null
  data: LiquidityFormData
}
export function useLiquidityMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: LiquidityFormData) => callLiquidity({ program: getInceptApp(), userPubKey, data }))
}