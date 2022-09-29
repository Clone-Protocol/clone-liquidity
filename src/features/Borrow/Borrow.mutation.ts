import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { BN } from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'

export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const { borrowIndex } = data

  console.log('close input data', data)

  const mint = await program.getMintPosition(borrowIndex)
	const assetInfo = await program.getAssetInfo(mint.poolIndex)
  const iassetAssociatedTokenAccount = await getTokenAccount(assetInfo.iassetMint, program.provider.wallet.publicKey, program.provider.connection);
  const collateralAssociatedTokenAccount = await getUSDiAccount(program);

  await program.closeMintPosition(
    iassetAssociatedTokenAccount!,
    Number(borrowIndex),
    collateralAssociatedTokenAccount!,
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

export const callEditCollateral = async ({
	program,
	userPubKey,
	data
}: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  const {
    borrowIndex,
    collateralAmount,
    editType
  } = data

  if (!collateralAmount) throw new Error('no collateral amount')

  console.log('edit input data', data)

	const collateralAssociatedTokenAccount = await getUSDiAccount(program);

  /// Deposit
  if (editType === 0) {
		await program.addCollateralToMint(
      borrowIndex,
			collateralAssociatedTokenAccount!,
			new BN(collateralAmount * 10 ** 8),
			[]
		)

    return {
      result: true,
      msg: 'added collateral to borrow'
    }
	} else { 
  /// Withdraw
    await program.withdrawCollateralFromMint(
      collateralAssociatedTokenAccount!,
      borrowIndex,
      new BN(collateralAmount * 10 ** 8),
      []
    )

    return {
      result: true,
      msg: 'withdraw collateral from borrow'
    }
	}
}

export const callEditBorrow = async ({
	program,
	userPubKey,
	data
}: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

  await program.loadManager()
  const {
    borrowIndex,
    borrowAmount,
    editType
  } = data

  if (!borrowAmount) throw new Error('no borrow more amount')

  console.log('edit input data', data)

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const iassetAssociatedTokenAccount = await getTokenAccount(assetInfo.iassetMint, program.provider.wallet.publicKey, program.connection);

  /// Deposit
  if (editType === 0) {
    await program.addiAssetToMint(
      iassetAssociatedTokenAccount!,
      new BN(borrowAmount * 10 ** 8),
      borrowIndex,
      []
    )

    return {
      result: true,
      msg: 'added borrow amount to borrow'
    }
	} else { 
  /// Withdraw
    await program.payBackiAssetToMint(
      iassetAssociatedTokenAccount!,
      new BN(borrowAmount * 10 ** 8),
      borrowIndex,
      []
    )

    return {
      result: true,
      msg: 'withdraw borrow amount from borrow'
    }
	}

}

type EditFormData = {
  borrowIndex: number,
	collateralAmount?: number,
	borrowAmount?: number
  editType: number
}
interface CallEditProps {
	program: Incept
	userPubKey: PublicKey | null
  data: EditFormData
}
export function useEditCollateralMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: EditFormData) => callEditCollateral({ program: getInceptApp(), userPubKey, data }))
}
export function useEditBorrowMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: EditFormData) => callEditBorrow({ program: getInceptApp(), userPubKey, data }))
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

  const collateralAssociatedTokenAccount = await getUSDiAccount(program);
  const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);

  if (iassetAssociatedTokenAccount !== undefined) {
    await program.initializeMintPosition(
      new BN(iassetAmount * 10 ** 8),
      new BN(collateralAmount * 10 ** 8),
      collateralAssociatedTokenAccount!,
      iassetAssociatedTokenAccount!,
      iassetIndex,
      collateralIndex,
      []
    )
  } else {
    const associatedToken = await getAssociatedTokenAddress(
      iassetMint,
      program.provider.wallet.publicKey,
    );
    const transactions = new Transaction().add(
      await createAssociatedTokenAccountInstruction(
        program.provider.wallet.publicKey,
        associatedToken,
        program.provider.wallet.publicKey,
        iassetMint
      )).add(
      await program.initializeMintPositionInstruction(
        collateralAssociatedTokenAccount!,
        associatedToken,
        new BN(iassetAmount * 10 ** 8),
        new BN(collateralAmount * 10 ** 8),
        iassetIndex,
        collateralIndex
    ));
    program.provider.sendAndConfirm!(transactions);
  }


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