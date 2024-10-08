import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useMutation } from '@tanstack/react-query'
import { CloneClient, toCloneScale, toScale } from 'clone-protocol-sdk/sdk/src/clone'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';
import { getTokenAccount, getCollateralAccount } from '~/utils/token_accounts'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { PaymentType } from 'clone-protocol-sdk/sdk/generated/clone'

export const callNew = async ({ program, userPubKey, setTxState, data }: CallNewProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('new input data', data)

	const { changeAmount, poolIndex } = data
	const oracles = await program.getOracles();

	const ixnCalls = [
		program.updatePricesInstruction(oracles),
		program.addLiquidityToCometInstruction(toScale(changeAmount, program.clone.collateral.scale), poolIndex)
	]
	const ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState)

	return {
		result: true
	}
}

type NewFormData = {
	poolIndex: number
	changeAmount: number
}
interface CallNewProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: NewFormData
}
export function useNewPositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: NewFormData) => callNew({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: NewFormData) => funcNoWallet())
	}
}


export const callEdit = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	const [userAccountData, poolsData, collateralAccountResult] = await Promise.allSettled([
		program.getUserAccount(),
		program.getPools(),
		getCollateralAccount(program)
	])

	if (
		userAccountData.status === 'rejected' ||
		poolsData.status === 'rejected' ||
		collateralAccountResult.status === 'rejected'
	) {
		throw new Error('Failed to fetch data!')
	}


	const { positionIndex, changeAmount, editType } = data
	const comet = userAccountData.value.comet
	const cometPosition = comet.positions[positionIndex]
	const poolIndex = cometPosition.poolIndex
	const oracles = await program.getOracles();

	const ixnCalls = [program.updatePricesInstruction(oracles)]
	if (editType === 0) {
		//deposit
		ixnCalls.push(program.addLiquidityToCometInstruction(toScale(changeAmount, program.clone.collateral.scale), poolIndex))
	} else {
		//withdraw
		ixnCalls.push(
			program.withdrawLiquidityFromCometInstruction(
				toScale(changeAmount, program.clone.collateral.scale),
				positionIndex
			))
	}

	const ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState)

	return {
		result: true
	}
}

type EditFormData = {
	positionIndex: number
	changeAmount: number
	editType: number
}
interface CallEditProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
}
export function useEditPositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: EditFormData) => callEdit({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}

export const callPayILD = async ({ program, userPubKey, setTxState, data }: CallPayILDProps) => {
	if (!userPubKey) throw new Error('no user public key')

	// NOTE: we shouldn't need to initialize either account here since we're paying from it.
	const [onassetAssociatedToken, collateralAssociatedTokenAddress] = await Promise.all([
		getAssociatedTokenAddress(
			data.onassetMint,
			program.provider.publicKey!,
		),
		getAssociatedTokenAddress(
			program.clone.collateral.mint,
			program.provider.publicKey!,
		)
	])

	const pools = await program.getPools()
	const oracles = await program.getOracles();
	const userAccount = await program.getUserAccount()

	// Pay ILD
	const ixnCalls: TransactionInstruction[] = [
		program.updatePricesInstruction(oracles)
	]

	if (toCloneScale(data.onassetILD) > 0) {
		ixnCalls.push(
			program.payCometILDInstruction(
				pools,
				userAccount,
				data.positionIndex,
				toCloneScale(data.ildAssetAmount),
				PaymentType.Onasset,
				onassetAssociatedToken,
				collateralAssociatedTokenAddress,
			)
		)
	}

	const collateralILD = toScale(data.collateralILD, program.clone.collateral.scale)
	if (collateralILD > 0) {
		ixnCalls.push(
			program.payCometILDInstruction(
				pools,
				userAccount,
				data.positionIndex,
				collateralILD,
				PaymentType.CollateralFromWallet,
				onassetAssociatedToken,
				collateralAssociatedTokenAddress,
			)
		)
	}
	await sendAndConfirm(program.provider, ixnCalls, setTxState)

	return {
		result: true
	}
}
type PayILDFormData = CloseFormData & {
	ildAssetAmount: number
	ildCollAmount: number
}
interface CallPayILDProps extends CallCloseProps {
	data: PayILDFormData
}
export function usePayILDMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: PayILDFormData) => callPayILD({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: PayILDFormData) => funcNoWallet())
	}
}

export const callRewards = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	const [onassetAssociatedToken, collateralAssociatedTokenAddress] = await Promise.all([
		getTokenAccount(
			data.onassetMint,
			program.provider.publicKey!,
			program.provider.connection
		),
		getAssociatedTokenAddress(
			program.clone.collateral.mint,
			program.provider.publicKey!,
		)
	])

	const pools = await program.getPools()
	const oracles = await program.getOracles();
	const userAccount = await program.getUserAccount()

	// Pay ILD
	const ixnCalls: TransactionInstruction[] = [
		program.updatePricesInstruction(oracles)
	]

	if (!onassetAssociatedToken.isInitialized) {
		ixnCalls.push(
			createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				onassetAssociatedToken.address,
				program.provider.publicKey!,
				data.onassetMint,
			)
		)
	}

	ixnCalls.push(
		program.collectLpRewardsInstruction(
			pools,
			userAccount,
			collateralAssociatedTokenAddress,
			onassetAssociatedToken.address,
			data.positionIndex
		)
	)
	await sendAndConfirm(program.provider, ixnCalls, setTxState)

	return {
		result: true
	}
}

export function useRewardsMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: CloseFormData) => callRewards({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: CloseFormData) => funcNoWallet())
	}
}

export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	const [onassetAssociatedToken] = await Promise.all([
		getTokenAccount(
			data.onassetMint,
			program.provider.publicKey!,
			program.provider.connection
		)
	])

	let onassetAssociatedTokenAddress = onassetAssociatedToken.address
	const oracles = await program.getOracles();

	// withdraw all liquidity
	const ixnCalls: TransactionInstruction[] = [
		program.updatePricesInstruction(oracles)
	]

	if (!onassetAssociatedToken) {
		const ata = await getAssociatedTokenAddress(
			data.onassetMint,
			program.provider.publicKey!
		)
		onassetAssociatedTokenAddress = ata
		ixnCalls.push(
			createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				ata,
				program.provider.publicKey!,
				data.onassetMint,
			)
		)
	}

	ixnCalls.push(
		program.removeCometPositionInstruction(data.positionIndex)
	)
	await sendAndConfirm(program.provider, ixnCalls, setTxState)

	return {
		result: true
	}
}

type CloseFormData = {
	positionIndex: number
	onassetILD: number
	collateralILD: number
	collateralBalance: number
	onassetBalance: number
	onassetMint: PublicKey
	committedCollateralLiquidity: number
}
interface CallCloseProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: CloseFormData
}
export function useClosePositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async (data: CloseFormData) => callClose({ program: await getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: CloseFormData) => funcNoWallet())
	}
}

