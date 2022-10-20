import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import * as anchor from "@project-serum/anchor";
import { useIncept } from '~/hooks/useIncept'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'

export const callClose = async ({ program, userPubKey, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { borrowIndex } = data

	console.log('close input data', data)

	const mint = await program.getMintPosition(borrowIndex)
	const assetInfo = await program.getAssetInfo(mint.poolIndex)
	const iassetAssociatedTokenAccount = await getTokenAccount(
		assetInfo.iassetMint,
		program.provider.wallet.publicKey,
		program.provider.connection
	)
	const collateralAssociatedTokenAccount = await getUSDiAccount(program)

	await program.closeMintPosition(
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
	program: Incept
	userPubKey: PublicKey | null
	data: CloseFormData
}
export function useCloseMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(), userPubKey, data }))
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
		await program.addCollateralToMint(
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
				program.manager!.usdiMint,
				program.provider.wallet.publicKey
			)
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.wallet.publicKey,
					usdiAssociatedToken,
					program.provider.wallet.publicKey,
					program.manager!.usdiMint
				)
			)
			tx.add(
				await program.withdrawCollateralFromMintInstruction(
					program.provider.wallet.publicKey,
					borrowIndex,
					usdiAssociatedToken,
					new anchor.BN(collateralAmount * 10 ** 8)
				)
			)
			await program.provider.send!(tx)
		} else {
			await program.withdrawCollateralFromMint(
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

	let mint = await program.getMintPosition(borrowIndex)
	let assetInfo = await program.getAssetInfo(mint.poolIndex)

	const iassetAssociatedTokenAccount = await getTokenAccount(
		assetInfo.iassetMint,
		program.provider.wallet.publicKey,
		program.connection
	)

	/// Deposit
	if (editType === 0) {
		if (iassetAssociatedTokenAccount !== undefined) {
			await program.addiAssetToMint(
				iassetAssociatedTokenAccount!,
				new anchor.BN(borrowAmount * 10 ** 8),
				borrowIndex,
				[]
			)
		} else {
			const associatedToken = await getAssociatedTokenAddress(
				assetInfo.iassetMint,
				program.provider.wallet.publicKey
			)
			const transactions = new Transaction()
				.add(
					await createAssociatedTokenAccountInstruction(
						program.provider.wallet.publicKey,
						associatedToken,
						program.provider.wallet.publicKey,
						assetInfo.iassetMint
					)
				)
				.add(
					await program.addiAssetToMintInstruction(
						associatedToken,
						new anchor.BN(borrowAmount * 10 ** 8),
						borrowIndex
					)
				)
			program.provider.send!(transactions)
		}

		return {
			result: true,
			msg: 'added borrow amount to borrow',
		}
	} else {
		/// Withdraw
		await program.payBackiAssetToMint(
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
	program: Incept
	userPubKey: PublicKey | null
	data: EditFormData
}
export function useEditCollateralMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: EditFormData) => callEditCollateral({ program: getInceptApp(), userPubKey, data }))
}
export function useEditBorrowMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: EditFormData) => callEditBorrow({ program: getInceptApp(), userPubKey, data }))
}

const runMintInstructions = async (
	incept: Incept,
	mintAmount: anchor.BN,
	collateralAmount: anchor.BN,
	iassetAccount: PublicKey | undefined,
	usdiAccount: PublicKey,
	iassetIndex: number,
	collateralIndex: number
) => {
	let iassetMint = (await incept.getAssetInfo(iassetIndex)).iassetMint

	const tx = new Transaction()

	const associatedToken = await getAssociatedTokenAddress(iassetMint, incept.provider.wallet.publicKey)

	let userAccount = await incept.getUserAccount()
	let mintPositionAddress = userAccount.mintPositions;
  let signers = [];
	// If mint positions account not created
	if (mintPositionAddress.equals(PublicKey.default)) {
		const mintPositionsAccount = anchor.web3.Keypair.generate();
    signers.push(mintPositionsAccount);
		mintPositionAddress = mintPositionsAccount.publicKey;
    tx.add(
      await incept.program.account.mintPositions.createInstruction(mintPositionsAccount)
    );
		tx.add(await incept.initializeMintPositionsInstruction(mintPositionsAccount))
	}

	// If iAsset token account not created
	if (iassetAccount === undefined) {
		tx.add(
			await createAssociatedTokenAccountInstruction(
				incept.program.provider.wallet.publicKey,
				associatedToken,
				incept.program.provider.wallet.publicKey,
				iassetMint
			)
		)
	}

	tx.add(await incept.updatePricesInstruction()).add(
		await incept.initializeMintPositionInstruction(
			usdiAccount,
			associatedToken,
			mintAmount,
			collateralAmount,
			iassetIndex,
			collateralIndex,
			mintPositionAddress
		)
	)

	await incept.provider.send!(tx, signers);
}

export const callBorrow = async ({ program, userPubKey, data }: CallBorrowProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('borrow input data', data)

	await program.loadManager()

	const { collateralIndex, iassetIndex, iassetAmount, collateralAmount } = data

	let iassetMint = (await program.getAssetInfo(iassetIndex)).iassetMint;

	const collateralAssociatedTokenAccount = await getUSDiAccount(program)
	const iassetAssociatedTokenAccount = await getTokenAccount(
		iassetMint,
		program.provider.wallet.publicKey,
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
	program: Incept
	userPubKey: PublicKey | null
	data: BorrowFormData
}
export function useBorrowMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: BorrowFormData) => callBorrow({ program: getInceptApp(), userPubKey, data }))
}
