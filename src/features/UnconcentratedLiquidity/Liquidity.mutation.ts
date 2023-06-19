import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { CloneClient, toDevnetScale } from "incept-protocol-sdk/sdk/src/clone"
import * as anchor from "@coral-xyz/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getOnUSDAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { funcNoWallet } from '../baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callWithdraw = async ({ program, userPubKey, setTxState, data }: CallWithdrawProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadClone()
	const { index, percent } = data
	const tokenData = await program.getTokenData();

	let fractionClaimable = percent / 100;

	let liquidityPositions = await program.getLiquidityPositions();
	let liquidityPosition = liquidityPositions[index]!;

	let liquidityTokenAmount = liquidityPosition.liquidityTokens * fractionClaimable;

	let iassetMint = tokenData.pools[liquidityPosition.poolIndex].assetInfo.iassetMint
	let liquidityTokenMint = tokenData.pools[liquidityPosition.poolIndex].liquidityTokenMint

	let iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	let collateralAssociatedTokenAccount = await getOnUSDAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	let ixnCalls: Promise<TransactionInstruction>[] = [program.updatePricesInstruction()]

	if (iassetAssociatedTokenAccount === undefined) {
		const iAssetAssociatedToken: PublicKey = await getAssociatedTokenAddress(
			iassetMint,
			program.provider.publicKey!,
		);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				iAssetAssociatedToken,
				program.provider.publicKey!,
				iassetMint
			))()
		);
		iassetAssociatedTokenAccount = iAssetAssociatedToken;
	}
	if (collateralAssociatedTokenAccount === undefined) {
		const usdiAssociatedToken = await getAssociatedTokenAddress(
			program.incept!.usdiMint,
			program.provider.publicKey!,
		);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				usdiAssociatedToken,
				program.provider.publicKey!,
				program.incept!.usdiMint
			))()
		);
		collateralAssociatedTokenAccount = usdiAssociatedToken;
	}

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.publicKey!,
		);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				liquidityAssociatedToken,
				program.provider.publicKey!,
				program.incept!.usdiMint
			))()
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}

	ixnCalls.push(
		program.withdrawUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			toDevnetScale(liquidityTokenAmount),
			liquidityPosition.poolIndex,
		)
	);
	let ixns = await Promise.all(ixnCalls)

	await sendAndConfirm(program.provider, ixns, setTxState)

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
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: WithdrawFormData
}
export function useWithdrawMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: WithdrawFormData) => callWithdraw({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: WithdrawFormData) => funcNoWallet())
	}
}


export const callDeposit = async ({ program, userPubKey, setTxState, data }: CallDepositProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadClone()
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
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: DepositFormData
}
export function useDepositMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: DepositFormData) => callDeposit({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: DepositFormData) => funcNoWallet())
	}
}

export const callLiquidity = async ({ program, userPubKey, setTxState, data }: CallLiquidityProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadClone()
	const { iassetIndex, iassetAmount } = data

	const tokenData = await program.getTokenData();

	const pool = tokenData.pools[iassetIndex];

	let iassetMint = pool.assetInfo.iassetMint;
	let liquidityTokenMint = pool.liquidityTokenMint;

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	const collateralAssociatedTokenAccount = await getOnUSDAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	let ixnCalls: Promise<TransactionInstruction>[] = []

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.publicKey!,
		);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				liquidityAssociatedToken,
				program.provider.publicKey!,
				liquidityTokenMint
			))()
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}

	ixnCalls.push(
		program.provideUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(iassetAmount * 10 ** 8),
			iassetIndex,
		)
	);

	const ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState)

	return {
		result: true
	}
}

type LiquidityFormData = {
	iassetIndex: number
	iassetAmount: number
}
interface CallLiquidityProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: LiquidityFormData
}
export function useLiquidityMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: LiquidityFormData) => callLiquidity({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: LiquidityFormData) => funcNoWallet())
	}
}