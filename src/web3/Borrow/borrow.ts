import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { BN } from '@project-serum/anchor'
import { toScaledNumber } from 'sdk/src/utils'

export const callClose = async (program: Incept, userPubKey: PublicKey, borrowIndex: number) => {
	if (!userPubKey) return null

	await program.loadManager()

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)

	await program.payBackiAssetToMint(
		iassetAssociatedTokenAccount.address,
		mint.borrowedIasset.val,
		Number(borrowIndex),
		[]
	)
}

export const callEdit = async (
	program: Incept,
	userPubKey: PublicKey,
	borrowIndex: number,
	totalCollateralAmount: number,
	totalBorrowAmount: number
) => {
	if (!userPubKey) return null

	await program.loadManager()

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)

	if (totalCollateralAmount > toScaledNumber(mint.collateralAmount)) {
		await program.addCollateralToMint(
			collateralAssociatedTokenAccount.address,
			new BN(totalCollateralAmount * 10 ** 8).sub(mint.collateralAmount.val),
			borrowIndex,
			[]
		)
		if (totalBorrowAmount < toScaledNumber(mint.borrowedIasset)) {
			if (totalBorrowAmount != 0) {
				await program.payBackiAssetToMint(
					iassetAssociatedTokenAccount.address,
					new BN(totalBorrowAmount * 10 ** 8).sub(mint.borrowedIasset.val),
					borrowIndex,
					[]
				)
			}
		} else if (totalBorrowAmount > toScaledNumber(mint.borrowedIasset)) {
			await program.addiAssetToMint(
				iassetAssociatedTokenAccount.address,
				mint.borrowedIasset.val.sub(new BN(totalBorrowAmount * 10 ** 8)),
				borrowIndex,
				[]
			)
		}
	} else if (totalCollateralAmount < toScaledNumber(mint.collateralAmount)) {
		if (totalCollateralAmount == 0) {
			if (totalBorrowAmount < toScaledNumber(mint.borrowedIasset)) {
				if (totalBorrowAmount != 0) {
					await program.payBackiAssetToMint(
						iassetAssociatedTokenAccount.address,
						new BN(totalBorrowAmount * 10 ** 8).sub(mint.borrowedIasset.val),
						borrowIndex,
						[]
					)
				}
			} else if (totalCollateralAmount > toScaledNumber(mint.collateralAmount)) {
				await program.addiAssetToMint(
					iassetAssociatedTokenAccount.address,
					mint.borrowedIasset.val.sub(new BN(totalBorrowAmount * 10 ** 8)),
					borrowIndex,
					[]
				)
			}
		} else {
			if (totalBorrowAmount < toScaledNumber(mint.borrowedIasset)) {
				if (totalBorrowAmount != 0) {
					await program.payBackiAssetToMint(
						iassetAssociatedTokenAccount.address,
						new BN(totalBorrowAmount * 10 ** 8).sub(mint.borrowedIasset.val),
						borrowIndex,
						[]
					)
				}

				await program.withdrawCollateralFromMint(
					collateralAssociatedTokenAccount.address,
					mint.collateralAmount.val.sub(new BN(totalCollateralAmount * 10 ** 8)),
					borrowIndex,
					[]
				)
			} else if (totalBorrowAmount > toScaledNumber(mint.borrowedIasset)) {
				await program.withdrawCollateralFromMint(
					collateralAssociatedTokenAccount.address,
					mint.collateralAmount.val.sub(new BN(totalCollateralAmount * 10 ** 8)),
					borrowIndex,
					[]
				)

				await program.addiAssetToMint(
					iassetAssociatedTokenAccount.address,
					mint.borrowedIasset.val.sub(new BN(totalBorrowAmount * 10 ** 8)),
					borrowIndex,
					[]
				)
			}
		}
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

	await program.initializeMintPosition(
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
