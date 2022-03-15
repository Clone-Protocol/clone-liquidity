import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { toScaledNumber } from 'sdk/src/utils'
import { BN } from '@project-serum/anchor'

export const callClose = async (program: Incept, userPubKey: PublicKey, poolIndex: number, cometIndex: number) => {
	if (!userPubKey) return null

	await program.loadManager()

	let pool = await program.getPool(poolIndex)

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(pool.assetInfo.iassetMint)
	const usdiAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	await program.closeComet(
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		usdiAssociatedTokenAccount.address,
		cometIndex,
		[]
	)
}

export const callEdit = async (
	program: Incept,
	userPubKey: PublicKey,
	cometIndex: number,
	totalCollateralAmount: number
) => {
	if (!userPubKey) return null

	await program.loadManager()

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	let comet = await program.getCometPosition(cometIndex)

	if (totalCollateralAmount > toScaledNumber(comet.collateralAmount)) {
		program.addCollateralToComet(
			collateralAssociatedTokenAccount.address,
			new BN(totalCollateralAmount * 10 ** 12).sub(comet.collateralAmount.val),
			cometIndex,
			[]
		)
	} else if (totalCollateralAmount < toScaledNumber(comet.collateralAmount)) {
		program.withdrawCollateralFromComet(
			collateralAssociatedTokenAccount.address,
			comet.collateralAmount.val.sub(new BN(totalCollateralAmount * 10 ** 12)),
			cometIndex,
			[]
		)
	}

	return
}

export const callComet = async ({
	program,
	userPubKey,
	iassetIndex,
	collateralIndex,
	usdiAmount,
	collateralAmount,
}: GetProps) => {
	if (!userPubKey) return null

	await program.loadManager()

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	program.initializeComet(
		collateralAssociatedTokenAccount.address,
		new BN(collateralAmount * 10 ** 12),
		new BN(usdiAmount * 10 ** 12),
		iassetIndex,
		collateralIndex,
		[]
	)

	return
}

interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
	collateralIndex: number
	iassetIndex: number
	collateralAmount: number
	usdiAmount: number
}
