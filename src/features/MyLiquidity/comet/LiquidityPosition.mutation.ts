import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useMutation } from '@tanstack/react-query'
import { CloneClient, toCloneScale } from 'clone-protocol-sdk/sdk/src/clone'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';
import { getTokenAccount, getCollateralAccount } from '~/utils/token_accounts'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token"

export const callNew = async ({ program, userPubKey, setTxState, data }: CallNewProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('new input data', data)

	const { changeAmount, poolIndex } = data

	const oracles = await program.getOracles();

	let ixnCalls = [
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

	const [cometResult, poolsData, collateralAccountResult] = await Promise.allSettled([
		program.getComet(),
		program.getPools(),
		getCollateralAccount(program)
	])

	if (
		cometResult.status === 'rejected' ||
		poolsData.status === 'rejected' ||
		collateralAccountResult.status === 'rejected'
	) {
		throw new Error('Failed to fetch data!')
	}


	const { positionIndex, changeAmount, editType } = data
	const comet = cometResult.value
	const cometPosition = comet.positions[positionIndex]
	const poolIndex = cometPosition.poolIndex

	let ixnCalls = [program.updatePricesInstruction()]
	/// Deposit
	if (editType === 0) {
		ixnCalls.push(program.addLiquidityToCometInstruction(toCloneScale(changeAmount), poolIndex))
		/// Withdraw
	} else {
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

	let [onassetAssociatedToken, onusdAssociatedTokenAddress, userAccount] = await Promise.all([
		getTokenAccount(
			data.onassetMint,
			program.provider.publicKey!,
			program.provider.connection
		),
		getAssociatedTokenAddress(
			program.clone.collateral.mint,
			program.provider.publicKey!,
		),
		program.getUserAccount(),
	])

	const [userAccountAddress, bump] = PublicKey.findProgramAddressSync(
		[Buffer.from("user"), userPubKey.toBuffer()],
		program.programId
	)

	const oracles = await program.getOracles();

	// Pay ILD && withdraw all liquidity
	let ixnCalls: Promise<TransactionInstruction>[] = [
		(async () => program.updatePricesInstruction(oracles))(),
	]

	if (!onassetAssociatedToken) {
		const ata = await getAssociatedTokenAddress(
			data.onassetMint,
			program.provider.publicKey!
		)
		onassetAssociatedToken = ata
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				ata,
				program.provider.publicKey!,
				data.onassetMint,
			))()
		)
	}

	const positionOnUsdLiquidity = toCloneScale(data.committedOnusdLiquidity)

	if (positionOnUsdLiquidity > 0) {
		ixnCalls.push(
			program.withdrawLiquidityFromCometInstruction(
				positionOnUsdLiquidity.muln(2), // Over withdraw to ensure its all paid.
				data.positionIndex,
			)
		)
	}

	if (toCloneScale(data.onassetILD) > 0) {
		ixnCalls.push(
			program.payCometILDInstruction(
				data.positionIndex,
				toCloneScale(data.onassetBalance),
				false,
				onassetAssociatedToken,
				onusdAssociatedTokenAddress,
			)
		)
	}

	if (toCloneScale(data.onusdILD) > 0) {
		ixnCalls.push(
			program.payCometILDInstruction(
				data.positionIndex,
				toCloneScale(data.onusdBalance),
				true,
				onassetAssociatedToken,
				onusdAssociatedTokenAddress,
			)
		)
	}

	ixnCalls.push(
		program.methods
			.collectLpRewards(data.positionIndex)
			.accounts({
				user: program.provider.publicKey!,
				userAccount: userAccountAddress,
				clone: program.cloneAddress[0],
				tokenData: program.clone!.tokenData,
				comet: userAccount.comet,
				onusdMint: program.clone.collateral.mint,
				onassetMint: data.onassetMint,
				userOnusdTokenAccount: onusdAssociatedTokenAddress,
				userOnassetTokenAccount: onassetAssociatedToken,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			.instruction()
	)

	ixnCalls.push(
		program.program.methods
			.removeCometPosition(data.positionIndex)
			.accounts({
				user: userPubKey,
				userAccount: userAccountAddress,
				clone: program.cloneAddress[0],
				tokenData: program.clone!.tokenData,
				comet: userAccount.comet,
			})
			.instruction()
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
	onusdILD: number
	onusdBalance: number
	onassetBalance: number
	onassetMint: PublicKey
	committedOnusdLiquidity: number
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


export const callCloseAll = async ({ program, userPubKey, setTxState }: CallCloseAllProps) => {
	if (!userPubKey) throw new Error('no user public key')

	//@TODO

	return {
		result: true
	}
}

interface CallCloseAllProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
}
export function useCloseAllPositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(async () => callCloseAll({ program: await getCloneApp(wallet), userPubKey, setTxState }))
	} else {
		return useMutation(() => funcNoWallet())
	}
}
