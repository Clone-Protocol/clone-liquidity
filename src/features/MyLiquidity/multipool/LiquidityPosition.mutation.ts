import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { CloneClient, toDevnetScale } from 'incept-protocol-sdk/sdk/src/clone'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';
import { getTokenAccount, getOnUSDAccount } from '~/utils/token_accounts'
import { getAssociatedTokenAddress } from "@solana/spl-token"

export const callNew = async ({ program, userPubKey, setTxState, data }: CallNewProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('new input data', data)

	const { changeAmount, poolIndex } = data

	await program.loadClone()

	let ixnCalls = [
		program.updatePricesInstruction(),
		program.addLiquidityToCometInstruction(toDevnetScale(changeAmount), poolIndex)
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
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: NewFormData) => callNew({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: NewFormData) => funcNoWallet())
	}
}


export const callEdit = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	await program.loadClone()

	const [cometResult, tokenDataResult, usdiAtaResult] = await Promise.allSettled([
		program.getComet(),
		program.getTokenData(),
		getOnUSDAccount(program)
	])

	if (
		cometResult.status === 'rejected' ||
		tokenDataResult.status === 'rejected' ||
		usdiAtaResult.status === 'rejected'
	) {
		throw new Error('Failed to fetch data!')
	}


	const { positionIndex, changeAmount, editType } = data
	const usdiAta = usdiAtaResult.value
	const comet = cometResult.value
	const cometPosition = comet.positions[positionIndex]
	const poolIndex = cometPosition.poolIndex
	const tokenData = tokenDataResult.value
	const pool = tokenData.pools[poolIndex]

	const iassetAta = await getTokenAccount(pool.assetInfo.iassetMint, userPubKey, program.provider.connection)

	let ixnCalls = [program.updatePricesInstruction()]
	/// Deposit
	if (editType === 0) {
		ixnCalls.push(program.addLiquidityToCometInstruction(toDevnetScale(changeAmount), poolIndex))
		/// Withdraw
	} else {
		const totalPoolUsdi = toNumber(pool.usdiAmount)
		const totalLpTokens = toNumber(pool.liquidityTokenSupply)
		const positionLpTokens = toNumber(cometPosition.liquidityTokenValue);
		const positionUsdi = toNumber(cometPosition.borrowedUsdi)

		let lpTokensToWithdraw = Math.min(
			(totalLpTokens * changeAmount) / totalPoolUsdi,
			positionLpTokens
		)
		// Catch the edge case if we want to withdraw everything.
		if (changeAmount === positionUsdi) {
			lpTokensToWithdraw = positionLpTokens
		}

		ixnCalls.push(
			program.withdrawLiquidityFromCometInstruction(
				toDevnetScale(lpTokensToWithdraw),
				positionIndex, iassetAta!, usdiAta!, false
			))

		// if (lpTokensToWithdraw === positionLpTokens) {
		// 	const collateralUsdi = toNumber(cometResult.value.collaterals[0].collateralAmount)
		// 	ixnCalls.push(program.payCometILDInstruction(positionIndex, 0, toDevnetScale(collateralUsdi).toNumber(), false))
		// }
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
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: EditFormData) => callEdit({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}

export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadClone()

	const [iAssetAssociatedToken, usdiAssociatedToken, userAccount] = await Promise.all([
		getAssociatedTokenAddress(
			data.iassetMint,
			program.provider.publicKey!,
		),
		getAssociatedTokenAddress(
			program.incept!.usdiMint,
			program.provider.publicKey!,
		),
		program.getUserAccount()
	])

	const [userAccountAddress, bump] = PublicKey.findProgramAddressSync(
		[Buffer.from("user"), userPubKey.toBuffer()],
		program.programId
	  )

	// Pay ILD && withdraw all liquidity
	let ixnCalls: Promise<TransactionInstruction>[] = [
		program.updatePricesInstruction(),
	]

	if (data.positionLpTokens > 0) {
		ixnCalls.push(
			program.withdrawLiquidityFromCometInstruction(
				toDevnetScale(data.positionLpTokens),
				data.positionIndex,
				iAssetAssociatedToken,
				usdiAssociatedToken,
				false
			)
		)
	}

	if (data.ildDebt > 0) {
		ixnCalls.push(
			program.payCometILDInstruction(
				data.positionIndex,
				toDevnetScale(data.balance),
				data.ildInUsdi,
				iAssetAssociatedToken,
				usdiAssociatedToken,
				false
			)
		)
	}

	ixnCalls.push(
		program.program.methods
			.removeCometPosition(data.positionIndex)
			.accounts({
				user: userPubKey,
				userAccount: userAccountAddress,
				incept: program.inceptAddress[0],
				tokenData: program.incept!.tokenData,
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
	ildInUsdi: boolean
	ildDebt: number
	balance: number
	iassetMint: PublicKey
	positionLpTokens: number
}
interface CallCloseProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: CloseFormData
}
export function useClosePositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: CloseFormData) => callClose({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: CloseFormData) => funcNoWallet())
	}
}


export const callCloseAll = async ({ program, userPubKey, setTxState }: CallCloseAllProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadClone()

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
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(() => callCloseAll({ program: getCloneApp(wallet), userPubKey, setTxState }))
	} else {
		return useMutation(() => funcNoWallet())
	}
}
