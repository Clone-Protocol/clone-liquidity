import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { BN } from '@project-serum/anchor'
import { toScaledNumber } from 'sdk/src/utils'

export const callClose = async (
	program: Incept,
	userPubKey: PublicKey,
	borrowIndex: number,
) => {
	if (!userPubKey) return null

	await program.loadManager()

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)

	await program.payBackiAssetToMint(
		iassetAssociatedTokenAccount.address,
		mint.borrowedIasset.val,
		mint.poolIndex,
		mint.collateralIndex,
		[]
	)
}

export const callEdit = async (
	program: Incept,
	userPubKey: PublicKey,
	borrowIndex: number,
	totalCollateralAmount: number
) => {
	if (!userPubKey) return null

	await program.loadManager()

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	let mint = await program.getMintPosition(borrowIndex)

	if (totalCollateralAmount > toScaledNumber(mint.collateralAmount)) {
		program.addCollateralToMint(
			collateralAssociatedTokenAccount.address,
			new BN(totalCollateralAmount * 10 ** 8).sub(mint.collateralAmount.val),
			mint.collateralIndex,
			[]
		)
	} else if (totalCollateralAmount < toScaledNumber(mint.collateralAmount)) {
		program.withdrawCollateralFromMint(
			collateralAssociatedTokenAccount.address,
			mint.collateralAmount.val.sub(new BN(totalCollateralAmount * 10 ** 8)),
			mint.collateralIndex,
			[]
		)
	}

	return
}

export const callBorrow = async ({
	program,
	userPubKey,
	collateralIndex,
	iassetIndex,
	iassetAmount,
	collateralAmount,
}: GetProps) => {
	if (!userPubKey) return null

	await program.loadManager()

	let iassetMint = (await program.getAssetInfo(iassetIndex)).iassetMint

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(iassetMint)

	program.initializeMintPosition(
		new BN(iassetAmount * 10 ** 8),
		new BN(collateralAmount * 10 ** 8),
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
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
	iassetAmount: number
}
