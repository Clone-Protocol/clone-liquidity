import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useMutation } from '@tanstack/react-query'
import { CloneClient, toCloneScale } from 'clone-protocol-sdk/sdk/src/clone'
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
		program.addLiquidityToCometInstruction(toCloneScale(changeAmount), poolIndex)
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
		ixnCalls.push(program.addLiquidityToCometInstruction(toCloneScale(changeAmount), poolIndex))
	} else {
		//withdraw
		ixnCalls.push(
			program.withdrawLiquidityFromCometInstruction(
				toCloneScale(changeAmount),
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

export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
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

	const [userAccountAddress, bump] = PublicKey.findProgramAddressSync(
		[Buffer.from("user"), userPubKey.toBuffer()],
		program.programId
	)
	let onassetAssociatedTokenAddress = onassetAssociatedToken.address
	const pools = await program.getPools()
	const oracles = await program.getOracles();
	const userAccount = await program.getUserAccount()

	// Pay ILD && withdraw all liquidity
	const ixnCalls: Promise<TransactionInstruction>[] = [
		(async () => program.updatePricesInstruction(oracles))(),
	]

	if (!onassetAssociatedToken) {
		const ata = await getAssociatedTokenAddress(
			data.onassetMint,
			program.provider.publicKey!
		)
		onassetAssociatedTokenAddress = ata
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				ata,
				program.provider.publicKey!,
				data.onassetMint,
			))()
		)
	}

	const positionCollateralLiquidity = toCloneScale(data.committedCollateralLiquidity)
	if (positionCollateralLiquidity > 0) {
		ixnCalls.push(
			(async () =>
				await program.withdrawLiquidityFromCometInstruction(
					positionCollateralLiquidity.muln(2), // Over withdraw to ensure its all paid.
					data.positionIndex,
				)
			)()
		)
	}

	if (toCloneScale(data.onassetILD) > 0) {
		ixnCalls.push(
			(async () =>
				await program.payCometILDInstruction(
					pools,
					userAccount,
					data.positionIndex,
					toCloneScale(data.onassetBalance),
					PaymentType.Collateral,
					onassetAssociatedToken.address,
					collateralAssociatedTokenAddress,
				)
			)()
		)
	}

	if (toCloneScale(data.collateralILD) > 0) {
		ixnCalls.push(
			(async () =>
				await program.payCometILDInstruction(
					pools,
					userAccount,
					data.positionIndex,
					toCloneScale(data.collateralBalance),
					PaymentType.CollateralFromWallet,
					onassetAssociatedToken.address,
					collateralAssociatedTokenAddress,
				)
			)()
		)
	}

	ixnCalls.push(
		(async () =>
			await program.collectLpRewardsInstruction(
				pools,
				userAccount,
				collateralAssociatedTokenAddress,
				onassetAssociatedToken.address,
				data.positionIndex
			)
		)()
	)

	const ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState)

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

