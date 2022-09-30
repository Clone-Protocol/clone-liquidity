import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import { BN } from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"

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

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	const liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.wallet.publicKey, program.provider.connection)
	const singlePoolComet = await program.getSinglePoolComet(data.index);

	if (iassetAssociatedTokenAccount === undefined || collateralAssociatedTokenAccount === undefined) {
		let tx = new Transaction().add(
			await program.paySinglePoolCometILDInstruction(
				data.index,
				getMantissa(singlePoolComet.collaterals[0].collateralAmount)
			)	
		);
		
		if (iassetAssociatedTokenAccount === undefined) {
			const iAssetAssociatedToken = await getAssociatedTokenAddress(
				iassetMint,
				program.provider.wallet.publicKey,
			  );
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.wallet.publicKey,
					iAssetAssociatedToken,
					program.provider.wallet.publicKey,
					iassetMint
				)
			);
		}

		if (collateralAssociatedTokenAccount === undefined) {
			const usdiAssociatedToken = await getAssociatedTokenAddress(
				program.manager!.usdiMint,
				program.provider.wallet.publicKey,
			  );
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.wallet.publicKey,
					usdiAssociatedToken,
					program.provider.wallet.publicKey,
					program.manager!.usdiMint
				)
			);
		}

		tx.add(
			await program.withdrawLiquidityInstruction(
				collateralAssociatedTokenAccount!,
				iassetAssociatedTokenAccount!,
				liquidityAssociatedTokenAccount!,
				new BN(liquidityTokenAmount * 10 ** 8),
				index,
			)
		);
		await program.provider.send!(tx);

	} else {
		await program.withdrawLiquidity(
			new BN(liquidityTokenAmount * 10 ** 8),
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			index,
			[]
		)
	}



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

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	const liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.wallet.publicKey, program.provider.connection)

	await program.provideLiquidity(
		new BN(iassetAmount * 10 ** 8),
		collateralAssociatedTokenAccount!,
		iassetAssociatedTokenAccount!,
		liquidityAssociatedTokenAccount!,
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

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	const liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.wallet.publicKey, program.provider.connection)

	await program.initializeLiquidityPosition(
		new BN(iassetAmount * 10 ** 8),
		collateralAssociatedTokenAccount!,
		iassetAssociatedTokenAccount!,
		liquidityAssociatedTokenAccount!,
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