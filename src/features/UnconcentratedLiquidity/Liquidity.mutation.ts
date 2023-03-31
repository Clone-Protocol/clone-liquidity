import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import * as anchor from "@project-serum/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { funcNoWallet } from '../baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callWithdraw = async ({ program, userPubKey, setTxState, data }: CallWithdrawProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { index, percent } = data
	const tokenData = await program.getTokenData();

	let fractionClaimable = percent / 100;

	let liquidityPositions = await program.getLiquidityPositions();
	let liquidityPosition = liquidityPositions[index]!;

	let liquidityTokenAmount = liquidityPosition.liquidityTokens * fractionClaimable;

	let iassetMint = tokenData.pools[liquidityPosition.poolIndex].assetInfo.iassetMint
	let liquidityTokenMint = tokenData.pools[liquidityPosition.poolIndex].liquidityTokenMint

	let iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	let collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	let tx = new Transaction();

	if (iassetAssociatedTokenAccount === undefined) {
		const iAssetAssociatedToken: PublicKey = await getAssociatedTokenAddress(
			iassetMint,
			program.provider.publicKey!,
		);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				iAssetAssociatedToken,
				program.provider.publicKey!,
				iassetMint
			)
		);
		iassetAssociatedTokenAccount = iAssetAssociatedToken;
	}
	if (collateralAssociatedTokenAccount === undefined) {
		const usdiAssociatedToken = await getAssociatedTokenAddress(
			program.incept!.usdiMint,
			program.provider.publicKey!,
		);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				usdiAssociatedToken,
				program.provider.publicKey!,
				program.incept!.usdiMint
			)
		);
		collateralAssociatedTokenAccount = usdiAssociatedToken;
	}

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.publicKey!,
		);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				liquidityAssociatedToken,
				program.provider.publicKey!,
				liquidityTokenMint
			)
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}

	tx.add(
		await program.withdrawUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(liquidityTokenAmount),
			index,
		)
	);

	//await program.provider.sendAndConfirm!(tx);
	await sendAndConfirm(program, tx, setTxState)

	return {
		result: true
	}
}

type WithdrawFormData = {
	index: number
	amount: number,
	percent: number
}
interface CallWithdrawProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: WithdrawFormData
}
export function useWithdrawMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: WithdrawFormData) => callWithdraw({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: WithdrawFormData) => funcNoWallet())
	}
}


export const callDeposit = async ({ program, userPubKey, setTxState, data }: CallDepositProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { index, iassetAmount } = data

	let liquidityPositions = await program.getLiquidityPositions();
	let liquidityPosition = liquidityPositions[index]!;

	return await callLiquidity({
		program, userPubKey, setTxState, data: {
			iassetIndex: liquidityPosition.poolIndex, iassetAmount
		}
	});
}

type DepositFormData = {
	index: number
	iassetAmount: number
}
interface CallDepositProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: DepositFormData
}
export function useDepositMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: DepositFormData) => callDeposit({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: DepositFormData) => funcNoWallet())
	}
}

export const callLiquidity = async ({ program, userPubKey, setTxState, data }: CallLiquidityProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
	const { iassetIndex, iassetAmount } = data

	const tokenData = await program.getTokenData();

	const pool = tokenData.pools[iassetIndex];

	let iassetMint = pool.assetInfo.iassetMint;
	let liquidityTokenMint = pool.liquidityTokenMint;

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	const tx = new Transaction();

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.publicKey!,
		);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				liquidityAssociatedToken,
				program.provider.publicKey!,
				liquidityTokenMint
			)
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}

	tx.add(
		await program.provideUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(iassetAmount * 10 ** 8),
			iassetIndex,
		)
	);

	//await program.provider.sendAndConfirm!(tx);
	await sendAndConfirm(program, tx, setTxState)

	return {
		result: true
	}
}

type LiquidityFormData = {
	iassetIndex: number
	iassetAmount: number
}
interface CallLiquidityProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: LiquidityFormData
}
export function useLiquidityMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: LiquidityFormData) => callLiquidity({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: LiquidityFormData) => funcNoWallet())
	}
}