import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { BN } from '@project-serum/anchor'

export const callWithdraw = async (
	program: Incept,
	userPubKey: PublicKey,
	index: number,
	amount: number,
) => {
	if (!userPubKey) return null

	await program.loadManager()

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


	program.withdrawLiquidity(
		new BN(liquidityTokenAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		liquidityAssociatedTokenAccount.address,
		index,
		[]
	)

	return
}

export const callDeposit = async (
	program: Incept,
	userPubKey: PublicKey,
	index: number,
	iassetAmount: number,
) => {
	if (!userPubKey) return null

	await program.loadManager()

	let liquidityPosition = await program.getLiquidityPosition(index)

	let iassetMint = (await program.getAssetInfo(liquidityPosition.poolIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(liquidityPosition.poolIndex)).liquidityTokenMint

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)
	const liquidityAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(liquidityTokenMint)

	program.provideLiquidity(
		new BN(iassetAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		liquidityAssociatedTokenAccount.address,
		index,
		[]
	)

	return
}

export const callLiquidity = async ({ program, userPubKey, iassetIndex, iassetAmount }: GetProps) => {
	if (!userPubKey) return null

	await program.loadManager()

	let iassetMint = (await program.getAssetInfo(iassetIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(iassetIndex)).liquidityTokenMint

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)
	const liquidityAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(liquidityTokenMint)

	program.initializeLiquidityPosition(
		new BN(iassetAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		liquidityAssociatedTokenAccount.address,
		iassetIndex,
		[]
	)

	return
}

interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
	iassetIndex: number
	iassetAmount: number
}
