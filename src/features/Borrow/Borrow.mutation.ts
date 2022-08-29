import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { BN } from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const { borrowIndex } = data

  console.log('close input data', data)

  const mint = await program.getMintPosition(borrowIndex)
	const assetInfo = await program.getAssetInfo(mint.poolIndex)
  const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)
  const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

  await program.closeMintPosition(
    iassetAssociatedTokenAccount.address,
    Number(borrowIndex),
    collateralAssociatedTokenAccount.address,
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
    collateralAmount,
    borrowAmount,
    editType
  } = data

  console.log('edit input data', data)

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(assetInfo.iassetMint)

  /// Deposit
	// if (totalCollateralAmount > toScaledNumber(mint.collateralAmount)) {
  if (editType === 0) {
		await program.addCollateralToMint(
      borrowIndex,
			collateralAssociatedTokenAccount.address,
			new BN(collateralAmount * 10 ** 8),
			[]
		)
		if (borrowAmount < toNumber(mint.borrowedIasset)) {
			if (borrowAmount != 0) {
				await program.payBackiAssetToMint(
					iassetAssociatedTokenAccount.address,
					new BN(borrowAmount * 10 ** 8),
					borrowIndex,
					[]
				)
			}
		} else if (borrowAmount > toNumber(mint.borrowedIasset)) {
			await program.addiAssetToMint(
				iassetAssociatedTokenAccount.address,
				new BN(borrowAmount * 10 ** 8),
				borrowIndex,
				[]
			)
		}

    return {
      result: true,
      msg: 'added collateral to borrow'
    }
	} else { 
  /// Withdraw
  //else if (totalCollateralAmount < toScaledNumber(mint.collateralAmount)) {	
    await program.withdrawCollateralFromMint(
      collateralAssociatedTokenAccount.address,
      borrowIndex,
      new BN(collateralAmount * 10 ** 8),
      []
    )
    if (borrowAmount < toNumber(mint.borrowedIasset)) {
      await program.payBackiAssetToMint(
        iassetAssociatedTokenAccount.address,
        new BN(borrowAmount * 10 ** 8),
        borrowIndex,
        []
      )
    } else if (borrowAmount > toNumber(mint.borrowedIasset)) {
      await program.addiAssetToMint(
        iassetAssociatedTokenAccount.address,
        new BN(borrowAmount * 10 ** 8),
        borrowIndex,
        []
      )
    }

    return {
      result: true,
      msg: 'withdraw collateral from borrow'
    }
	}
}

type EditFormData = {
  borrowIndex: number,
	collateralAmount: number,
	borrowAmount: number
  editType: number
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