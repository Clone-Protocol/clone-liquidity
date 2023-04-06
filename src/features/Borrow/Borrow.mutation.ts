import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { getMantissa } from 'incept-protocol-sdk/sdk/src/decimal'
import * as anchor from "@coral-xyz/anchor";
import { useIncept } from '~/hooks/useIncept'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { funcNoWallet } from '../baseQuery';
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
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
	let mintPosition = (await program.getBorrowPositions()).borrowPositions[
		borrowIndex
	];

	let ixnCalls = [
		program.updatePricesInstruction(),
		program.subtractIassetFromBorrowInstruction(
			iassetAssociatedTokenAccount!,
			new anchor.BN(getMantissa(mintPosition.borrowedIasset)),
			borrowIndex
		),
		program.withdrawCollateralFromBorrowInstruction(
			program.provider.publicKey!,
			borrowIndex,
			collateralAssociatedTokenAccount!,
			new anchor.BN(getMantissa(mintPosition.collateralAmount))
		)
	]

	const ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState)

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
	setTxState: (state: TransactionStateType) => void
	data: CloseFormData
}
export function useCloseMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: CloseFormData) => funcNoWallet())
	}
}

export const callEditCollateral = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { borrowIndex, collateralAmount, editType } = data

	if (!collateralAmount) throw new Error('no collateral amount')

	console.log('edit input data', data)

	const collateralAssociatedTokenAccount = await getUSDiAccount(program)

	let ixnCalls: Promise<TransactionInstruction>[] = [program.updatePricesInstruction()]
	let result: { result: boolean, msg: string };

	/// Deposit
	if (editType === 0) {
		ixnCalls.push(program.addCollateralToBorrowInstruction(
			borrowIndex,
			collateralAssociatedTokenAccount!,
			new anchor.BN(collateralAmount * 10 ** 8),
		))

		result = {
			result: true,
			msg: 'added collateral to borrow',
		}
	} else {
		/// Withdraw
		const usdiAssociatedToken = await getAssociatedTokenAddress(
			program.incept!.usdiMint,
			program.provider.publicKey!
		)
		if (collateralAssociatedTokenAccount === undefined) {
			ixnCalls.push(
				(async () => createAssociatedTokenAccountInstruction(
					program.provider.publicKey!,
					usdiAssociatedToken,
					program.provider.publicKey!,
					program.incept!.usdiMint
				))()
			)
		}
		ixnCalls.push(
			program.withdrawCollateralFromBorrowInstruction(
				program.provider.publicKey!,
				borrowIndex,
				usdiAssociatedToken,
				new anchor.BN(collateralAmount * 10 ** 8)
			)
		)

		result = {
			result: true,
			msg: 'withdraw collateral from borrow',
		}
	}

	const ixns = await Promise.all(ixnCalls)
	console.log("n ixns:", ixns.length);
	await sendAndConfirm(program.provider, ixns, setTxState)

	return result;
}

export const callEditBorrow = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
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
	let ixnCalls: Promise<TransactionInstruction>[] = [program.updatePricesInstruction()]
	let result: { result: boolean, msg: string };

	const associatedToken = await getAssociatedTokenAddress(
		assetInfo.iassetMint,
		program.provider.publicKey!
	)

	/// Deposit
	if (editType === 0) {
		ixnCalls.push(
			program.addIassetToBorrowInstruction(
				associatedToken,
				new anchor.BN(borrowAmount * 10 ** 8),
				borrowIndex
			)
		)
		result = {
			result: true,
			msg: 'added borrow amount to borrow',
		}
	} else {
		if (iassetAssociatedTokenAccount === undefined) {
			ixnCalls.push(
				(async () => createAssociatedTokenAccountInstruction(
					program.provider.publicKey!,
					associatedToken,
					program.provider.publicKey!,
					assetInfo.iassetMint
				))()
			)
		}
		ixnCalls.push(
			program.subtractIassetFromBorrowInstruction(
				iassetAssociatedTokenAccount!,
				new anchor.BN(borrowAmount * 10 ** 8),
				borrowIndex,
			))

		result = {
			result: true,
			msg: 'withdraw borrow amount from borrow',
		}
	}

	let ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState)

	return result
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
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
}
export function useEditCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: EditFormData) => callEditCollateral({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}

}
export function useEditBorrowMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: EditFormData) => callEditBorrow({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}

const runMintInstructions = async (
	incept: InceptClient,
	mintAmount: anchor.BN,
	collateralAmount: anchor.BN,
	iassetAccount: PublicKey | undefined,
	usdiAccount: PublicKey,
	iassetIndex: number,
	collateralIndex: number,
	setTxState: (state: TransactionStateType) => void
) => {
	const tokenData = await incept.getTokenData();
	const { userPubkey, bump } = await incept.getUserAddress()
	let iassetMint = tokenData.pools[iassetIndex].assetInfo.iassetMint

	let ixnCalls: Promise<TransactionInstruction>[] = [incept.updatePricesInstruction()]

	const associatedToken = await getAssociatedTokenAddress(iassetMint, incept.provider.publicKey!)

	let userAccount = await incept.getUserAccount()
	let borrowPositionAddress = userAccount.borrowPositions;
	let signers = [];
	// If mint positions account not created
	if (borrowPositionAddress.equals(PublicKey.default)) {
		const borrowPositionsAccount = anchor.web3.Keypair.generate();
		signers.push(borrowPositionsAccount);
		borrowPositionAddress = borrowPositionsAccount.publicKey;
		ixnCalls.push(incept.program.account.borrowPositions.createInstruction(borrowPositionsAccount));
		ixnCalls.push(incept.program.methods
			.initializeBorrowPositions()
			.accounts({
				user: incept.provider.publicKey!,
				userAccount: userPubkey,
				borrowPositions: borrowPositionsAccount.publicKey,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.instruction())
	}

	// If iAsset token account not created
	if (iassetAccount === undefined) {
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				incept.program.provider.publicKey!,
				associatedToken,
				incept.program.provider.publicKey!,
				iassetMint
			))()
		)
	}

	ixnCalls.push(
		incept.initializeBorrowPositionInstruction(
			usdiAccount,
			associatedToken,
			mintAmount,
			collateralAmount,
			iassetIndex,
			collateralIndex,
			borrowPositionAddress
		)
	)

	let ixns = await Promise.all(ixnCalls)

	// await incept.provider.sendAndConfirm!(tx, signers);
	await sendAndConfirm(incept.provider, ixns, setTxState, signers)
}

export const callBorrow = async ({ program, userPubKey, setTxState, data }: CallBorrowProps) => {
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
		collateralIndex,
		setTxState,
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
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: BorrowFormData
}
export function useBorrowMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: BorrowFormData) => callBorrow({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: BorrowFormData) => funcNoWallet())
	}
}
