import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { BN } from '@project-serum/anchor'
import { toScaledNumber } from 'incept-protocol-sdk/sdk/src/utils'
import { useIncept } from '~/hooks/useIncept'

export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const { borrowIndex } = data

  console.log('close input data', data)

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)

	await program.payBackiAssetToMint(
		iassetAssociatedTokenAccount.address,
		mint.borrowedIasset.val,
		Number(borrowIndex),
		[]
	)
  return {
    result: true
  }
}

type CloseFormData = {
  borrowIndex: number,
}
interface CallCloseProps {
	program: Incept
	userPubKey: PublicKey | null
  data: CloseFormData
}
export function useCloseMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(), userPubKey, data }))
}

export const callEdit = async ({
	program,
	userPubKey,
	data
}: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const {
    borrowIndex,
    totalCollateralAmount,
    totalBorrowAmount
  } = data

  console.log('edit input data', data)

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
  return {
    result: true
  }
}

type EditFormData = {
  borrowIndex: number,
	totalCollateralAmount: number,
	totalBorrowAmount: number
}
interface CallEditProps {
	program: Incept
	userPubKey: PublicKey | null
  data: EditFormData
}
export function useEditMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(), userPubKey, data }))
}


export const callBorrow = async ({
	program,
	userPubKey,
  data,
}: CallBorrowProps) => {
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

type BorrowFormData = {
  collateralIndex: number
	iassetIndex: number
	collateralAmount: number
	iassetAmount: number
}
interface CallBorrowProps {
	program: Incept
	userPubKey: PublicKey | null
  data: BorrowFormData
}
export function useBorrowMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: BorrowFormData) => callBorrow({ program: getInceptApp(), userPubKey, data }))
}