import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { BN } from '@project-serum/anchor'

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
