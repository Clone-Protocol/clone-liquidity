import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import * as anchor from "@project-serum/anchor";
import { useIncept } from '~/hooks/useIncept'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export const callClose = async ({ program, userPubKey, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { borrowIndex } = data

	console.log('close input data', data)

	const borrows = await program.getBorrowPositions()
	const tokenData = await program.getTokenData();
	const borrowPosition = borrows.borrowPositions[borrowIndex];
	const assetInfo = tokenData.pools[borrowPosition.poolIndex].assetInfo
	const iassetAssociatedTokenAccount = await getTokenAccount(
		assetInfo.iassetMint,
		program.provider.publicKey!,
		program.provider.connection
	)
	const collateralAssociatedTokenAccount = await getUSDiAccount(program)

	await program.closeBorrowPosition(
		iassetAssociatedTokenAccount!,
		Number(borrowIndex),
		collateralAssociatedTokenAccount!,
		[]
	)

	return {
		result: true,
	}
}

type CloseFormData = {
	borrowIndex: number
}
interface CallCloseProps {
	program: InceptClient
	userPubKey: PublicKey | null
	data: CloseFormData
}
export function useCloseMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(wallet), userPubKey, data }))
	} else {
		throw new Error('no wallet')
	}
}

export const callEditCollateral = async ({ program, userPubKey, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { borrowIndex, collateralAmount, editType } = data

	if (!collateralAmount) throw new Error('no collateral amount')

	console.log('edit input data', data)

	const collateralAssociatedTokenAccount = await getUSDiAccount(program)

	/// Deposit
	if (editType === 0) {
		await program.addCollateralToBorrow(
			borrowIndex,
			collateralAssociatedTokenAccount!,
			new anchor.BN(collateralAmount * 10 ** 8),
			[]
		)

		return {
			result: true,
			msg: 'added collateral to borrow',
		}
	} else {
		/// Withdraw

		if (collateralAssociatedTokenAccount === undefined) {
			let tx = new Transaction()
			const usdiAssociatedToken = await getAssociatedTokenAddress(
				program.incept!.usdiMint,
				program.provider.publicKey!
			)
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.publicKey!,
					usdiAssociatedToken,
					program.provider.publicKey!,
					program.incept!.usdiMint
				)
			)
			tx.add(
				await program.withdrawCollateralFromBorrowInstruction(
					program.provider.publicKey!,
					borrowIndex,
					usdiAssociatedToken,
					new anchor.BN(collateralAmount * 10 ** 8)
				)
			)
			await program.provider.sendAndConfirm!(tx)
		} else {
			await program.withdrawCollateralFromBorrow(
				collateralAssociatedTokenAccount!,
				borrowIndex,
				new anchor.BN(collateralAmount * 10 ** 8),
				[]
			)
		}

		return {
			result: true,
			msg: 'withdraw collateral from borrow',
		}
	}
}

export const callEditBorrow = async ({ program, userPubKey, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { borrowIndex, borrowAmount, editType } = data

	if (!borrowAmount) throw new Error('no borrow more amount')

	console.log('edit input data', data)
	const borrows = await program.getBorrowPositions()
	const tokenData = await program.getTokenData();
	const borrowPosition = borrows.borrowPositions[borrowIndex];
	const assetInfo = tokenData.pools[borrowPosition.poolIndex].assetInfo

	const iassetAssociatedTokenAccount = await getTokenAccount(
		assetInfo.iassetMint,
		program.provider.publicKey!,
		program.connection
	)

	/// Deposit
	if (editType === 0) {
		if (iassetAssociatedTokenAccount !== undefined) {
			await program.addIassetToBorrow(
				iassetAssociatedTokenAccount!,
				new anchor.BN(borrowAmount * 10 ** 8),
				borrowIndex,
				[]
			)
		} else {
			const associatedToken = await getAssociatedTokenAddress(
				assetInfo.iassetMint,
				program.provider.publicKey!
			)
			const transactions = new Transaction()
				.add(
					await createAssociatedTokenAccountInstruction(
						program.provider.publicKey!,
						associatedToken,
						program.provider.publicKey!,
						assetInfo.iassetMint
					)
				)
				.add(
					await program.addIassetToBorrowInstruction(
						associatedToken,
						new anchor.BN(borrowAmount * 10 ** 8),
						borrowIndex
					)
				)
			program.provider.sendAndConfirm!(transactions)
		}

		return {
			result: true,
			msg: 'added borrow amount to borrow',
		}
	} else {
		/// Withdraw
		await program.subtractIassetFromBorrow(
			iassetAssociatedTokenAccount!,
			new anchor.BN(borrowAmount * 10 ** 8),
			borrowIndex,
			[]
		)

		return {
			result: true,
			msg: 'withdraw borrow amount from borrow',
		}
	}
}

type EditFormData = {
	borrowIndex: number
	collateralAmount?: number
	borrowAmount?: number
	editType: number
}
interface CallEditProps {
	program: InceptClient
	userPubKey: PublicKey | null
	data: EditFormData
}
export function useEditCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useMutation((data: EditFormData) => callEditCollateral({ program: getInceptApp(wallet), userPubKey, data }))
	} else {
		throw new Error('no wallet')
	}

}
export function useEditBorrowMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useMutation((data: EditFormData) => callEditBorrow({ program: getInceptApp(wallet), userPubKey, data }))
	} else {
		throw new Error('no wallet')
	}
}

const runMintInstructions = async (
	incept: InceptClient,
	mintAmount: anchor.BN,
	collateralAmount: anchor.BN,
	iassetAccount: PublicKey | undefined,
	usdiAccount: PublicKey,
	iassetIndex: number,
	collateralIndex: number
) => {
	const tokenData = await incept.getTokenData();
	let iassetMint = tokenData.pools[iassetIndex].assetInfo.iassetMint

	const tx = new Transaction()

	const associatedToken = await getAssociatedTokenAddress(iassetMint, incept.provider.publicKey!)

	let userAccount = await incept.getUserAccount()
	let mintPositionAddress = userAccount.borrowPositions;
	let signers = [];
	// If mint positions account not created
	if (mintPositionAddress.equals(PublicKey.default)) {
		const mintPositionsAccount = anchor.web3.Keypair.generate();
		signers.push(mintPositionsAccount);
		mintPositionAddress = mintPositionsAccount.publicKey;
		tx.add(
			await incept.program.account.borrowPositions.createInstruction(mintPositionsAccount)
		);
		tx.add(await incept.initializeBorrowPositionsAccountInstruction(mintPositionsAccount))
	}

	// If iAsset token account not created
	if (iassetAccount === undefined) {
		tx.add(
			await createAssociatedTokenAccountInstruction(
				incept.program.provider.publicKey!,
				associatedToken,
				incept.program.provider.publicKey!,
				iassetMint
			)
		)
	}

	tx.add(await incept.updatePricesInstruction()).add(
		await incept.initializeBorrowPositionInstruction(
			usdiAccount,
			associatedToken,
			mintAmount,
			collateralAmount,
			iassetIndex,
			collateralIndex,
			mintPositionAddress
		)
	)

	await incept.provider.sendAndConfirm!(tx, signers);
}

export const callBorrow = async ({ program, userPubKey, data }: CallBorrowProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('borrow input data', data)

	await program.loadManager()

	const { collateralIndex, iassetIndex, iassetAmount, collateralAmount } = data

	const tokenData = await program.getTokenData();
	let iassetMint = tokenData.pools[iassetIndex].assetInfo.iassetMint

	const collateralAssociatedTokenAccount = await getUSDiAccount(program)
	const iassetAssociatedTokenAccount = await getTokenAccount(
		iassetMint,
		program.provider.publicKey!,
		program.provider.connection
	)

	await runMintInstructions(
		program,
		new anchor.BN(iassetAmount * 10 ** 8),
		new anchor.BN(collateralAmount * 10 ** 8),
		iassetAssociatedTokenAccount,
		collateralAssociatedTokenAccount!,
		iassetIndex,
		collateralIndex
	)

	return {
		result: true,
	}
}

type BorrowFormData = {
	collateralIndex: number
	iassetIndex: number
	collateralAmount: number
	iassetAmount: number
}
interface CallBorrowProps {
	program: InceptClient
	userPubKey: PublicKey | null
	data: BorrowFormData
}
export function useBorrowMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useMutation((data: BorrowFormData) => callBorrow({ program: getInceptApp(wallet), userPubKey, data }))
	} else {
		throw new Error('no wallet')
	}
}
