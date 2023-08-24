import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useMutation } from '@tanstack/react-query'
import { CloneClient, toCloneScale } from 'clone-protocol-sdk/sdk/src/clone'
import * as anchor from "@coral-xyz/anchor";
import { useClone } from '~/hooks/useClone'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getTokenAccount, getCollateralAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { funcNoWallet } from '../baseQuery';
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	const { borrowIndex } = data

	console.log('close input data', data)

	const userAccount = await program.getUserAccount();
	const borrowPositions = userAccount.borrows
	const pools = await program.getPools()
	const oracles = await program.getOracles()
	const borrowPosition = borrowPositions[borrowIndex];
	const assetInfo = pools.pools[borrowPosition.poolIndex].assetInfo
	const onassetAssociatedTokenAccount = await getTokenAccount(
		assetInfo.onassetMint,
		program.provider.publicKey!,
		program.provider.connection
	)
	const collateralAssociatedTokenAccount = await getCollateralAccount(program)
	let mintPosition = borrowPositions[borrowIndex];

	let ixnCalls = [
		program.updatePricesInstruction(oracles),
		program.payBorrowDebtInstruction(
			pools,
			userAccount,
			onassetAssociatedTokenAccount.address,
			new anchor.BN(mintPosition.borrowedOnasset),
			borrowIndex
		),
		program.withdrawCollateralFromBorrowInstruction(
			borrowIndex,
			collateralAssociatedTokenAccount.address,
			new anchor.BN(mintPosition.collateralAmount)
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
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: CloseFormData
}
export function useCloseMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: CloseFormData) => callClose({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: CloseFormData) => funcNoWallet())
	}
}

export const callEditCollateral = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	const { borrowIndex, collateralAmount, editType } = data

	if (!collateralAmount) throw new Error('no collateral amount')

	console.log('edit input data', data)

	const collateralAssociatedTokenAccount = await getCollateralAccount(program)
	const oracles = await program.getOracles()

	let ixnCalls: Promise<TransactionInstruction>[] = []
	ixnCalls.push((async () => await program.updatePricesInstruction(oracles))())
	let result: { result: boolean, msg: string };

	/// Deposit
	if (editType === 0) {
		ixnCalls.push(
			(async () =>
				await program.addCollateralToBorrowInstruction(
					borrowIndex,
					collateralAssociatedTokenAccount.address,
					new anchor.BN(collateralAmount * 10 ** 8),
				))()
		)

		result = {
			result: true,
			msg: 'added collateral to borrow',
		}
	} else {
		/// Withdraw
		const usdiAssociatedToken = await getAssociatedTokenAddress(
			program.clone.collateral.mint,
			program.provider.publicKey!
		)
		if (collateralAssociatedTokenAccount === undefined) {
			ixnCalls.push(
				(async () =>
					await createAssociatedTokenAccountInstruction(
						program.provider.publicKey!,
						usdiAssociatedToken,
						program.provider.publicKey!,
						program.clone.collateral.mint
					))()
			)
		}
		ixnCalls.push(
			(async () =>
				await program.withdrawCollateralFromBorrowInstruction(
					borrowIndex,
					usdiAssociatedToken,
					new anchor.BN(collateralAmount * 10 ** 8)
				)
			)()
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

	const { borrowIndex, borrowAmount, editType } = data

	if (!borrowAmount) throw new Error('no borrow more amount')

	console.log('edit input data', data)
	const userAccount = await program.getUserAccount()
	const pools = await program.getPools()
	const oracles = await program.getOracles()
	const borrowPositions = userAccount.borrows
	const borrowPosition = borrowPositions[borrowIndex];
	const assetInfo = pools.pools[borrowPosition.poolIndex].assetInfo

	const onassetAssociatedTokenAccount = await getTokenAccount(
		assetInfo.onassetMint,
		program.provider.publicKey!,
		program.provider.connection
	)
	let ixnCalls: Promise<TransactionInstruction>[] = []
	ixnCalls.push((async () => await program.updatePricesInstruction(oracles))())
	let result: { result: boolean, msg: string };

	const associatedToken = await getAssociatedTokenAddress(
		assetInfo.onassetMint,
		program.provider.publicKey!
	)

	/// Borrow more
	if (editType === 0) {
		if (onassetAssociatedTokenAccount === undefined) {
			ixnCalls.push(
				(async () => createAssociatedTokenAccountInstruction(
					program.provider.publicKey!,
					associatedToken,
					program.provider.publicKey!,
					assetInfo.onassetMint
				))()
			)
		}
		ixnCalls.push(
			(async () =>
				program.borrowMoreInstruction(
					pools,
					userAccount,
					onassetAssociatedTokenAccount.address,
					toCloneScale(borrowAmount),
					borrowIndex,
				))()
		)

		result = {
			result: true,
			msg: 'withdraw borrow amount from borrow',
		}
	} else {
		ixnCalls.push(
			(async () =>
				program.payBorrowDebtInstruction(
					pools,
					userAccount,
					associatedToken,
					toCloneScale(borrowAmount),
					borrowIndex
				)
			)()
		)
		result = {
			result: true,
			msg: 'added borrow amount to borrow',
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
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
}
export function useEditCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: EditFormData) => callEditCollateral({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}

}
export function useEditBorrowMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: EditFormData) => callEditBorrow({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}

const runMintInstructions = async (
	program: CloneClient,
	mintAmount: anchor.BN,
	collateralAmount: anchor.BN,
	iassetAccount: PublicKey | undefined,
	usdiAccount: PublicKey,
	onassetIndex: number,
	collateralIndex: number,
	setTxState: (state: TransactionStateType) => void
) => {
	const pools = await program.getPools()
	const oracles = await program.getOracles()
	const { userPubkey, bump } = await program.getUserAddress()
	let iassetMint = pools.pools[onassetIndex].assetInfo.onassetMint

	let ixnCalls: Promise<TransactionInstruction>[] = []
	ixnCalls.push((async () => await program.updatePricesInstruction(oracles))())

	const associatedToken = await getAssociatedTokenAddress(iassetMint, program.provider.publicKey!)

	let userAccount = await program.getUserAccount()
	let borrowPositionAddress = userAccount.borrowPositions;
	let signers = [];
	// If mint positions account not created
	if (borrowPositionAddress.equals(PublicKey.default)) {
		const borrowPositionsAccount = anchor.web3.Keypair.generate();
		signers.push(borrowPositionsAccount);
		borrowPositionAddress = borrowPositionsAccount.publicKey;
		ixnCalls.push(program.program.account.borrowPositions.createInstruction(borrowPositionsAccount));
		ixnCalls.push(program.program.methods
			.initializeBorrowPositions()
			.accounts({
				user: program.provider.publicKey!,
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
				program.provider.publicKey!,
				associatedToken,
				program.provider.publicKey!,
				iassetMint
			))()
		)
	}

	ixnCalls.push(
		program.initializeBorrowPositionInstruction(
			pools,
			usdiAccount,
			associatedToken,
			mintAmount,
			collateralAmount,
			onassetIndex,
			collateralIndex,
			borrowPositionAddress
		)
	)

	let ixns = await Promise.all(ixnCalls)

	// await clone.provider.sendAndConfirm!(tx, signers);
	await sendAndConfirm(program.provider, ixns, setTxState, signers)
}

export const callBorrow = async ({ program, userPubKey, setTxState, data }: CallBorrowProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('borrow input data', data)

	const { collateralIndex, onassetIndex, onassetAmount, collateralAmount } = data

	const pools = await program.getPools()
	let onassetMint = pools.pools[onassetIndex].assetInfo.onassetMint

	const collateralAssociatedTokenAccount = await getCollateralAccount(program)
	const onassetAssociatedTokenAccount = await getTokenAccount(
		onassetMint,
		program.provider.publicKey!,
		program.provider.connection
	)

	await runMintInstructions(
		program,
		new anchor.BN(onassetAmount * 10 ** 8),
		new anchor.BN(collateralAmount * 10 ** 8),
		onassetAssociatedTokenAccount.address,
		collateralAssociatedTokenAccount.address,
		onassetIndex,
		collateralIndex,
		setTxState,
	)

	return {
		result: true
	}
}

type BorrowFormData = {
	collateralIndex: number
	onassetIndex: number
	collateralAmount: number
	onassetAmount: number
}
interface CallBorrowProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: BorrowFormData
}
export function useBorrowMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: BorrowFormData) => callBorrow({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: BorrowFormData) => funcNoWallet())
	}
}
