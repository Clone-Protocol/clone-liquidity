import { PublicKey } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { InceptClient, toDevnetScale } from 'incept-protocol-sdk/sdk/src/incept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'

export const callNew = async ({ program, userPubKey, setTxState, data }: CallNewProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('new input data', data)

	const { changeAmount, poolIndex } = data

	await program.loadManager()

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
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: NewFormData
}
export function useNewPositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: NewFormData) => callNew({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: NewFormData) => funcNoWallet())
	}
}


export const callEdit = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	await program.loadManager()

	const [cometResult, tokenDataResult, usdiAtaResult] = await Promise.allSettled([
		program.getComet(),
		program.getTokenData(),
		getUSDiAccount(program)
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
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
}
export function useEditPositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}

export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()

	//@TODO

	return {
		result: true
	}
}

type CloseFormData = {
	positionIndex: number
}
interface CallCloseProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: CloseFormData
}
export function useClosePositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: CloseFormData) => funcNoWallet())
	}
}


export const callCloseAll = async ({ program, userPubKey, setTxState }: CallCloseAllProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()

	//@TODO

	return {
		result: true
	}
}

interface CallCloseAllProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
}
export function useCloseAllPositionMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation(() => callCloseAll({ program: getInceptApp(wallet), userPubKey, setTxState }))
	} else {
		return useMutation(() => funcNoWallet())
	}
}
