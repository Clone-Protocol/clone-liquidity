import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from 'sdk/src'
import { BN } from '@project-serum/anchor'
import { toScaledNumber } from 'sdk/src/utils'
import { useIncept } from '~/hooks/useIncept'

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
  data,
}: GetProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('borrow input data', data)

	await program.loadManager()

  const { collateralIndex, iassetIndex, iassetAmount, collateralAmount } = data
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

  return {
    result: true
  }
}

type FormData = {
  collateralIndex: number
	iassetIndex: number
	collateralAmount: number
	iassetAmount: number
}
interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
  data: FormData
}

export function useBorrowMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: FormData) => callBorrow({ program: getInceptApp(), userPubKey, data }))
}