import { PublicKey, Transaction } from '@solana/web3.js'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { calculateCometRecenterMultiPool } from "incept-protocol-sdk/sdk/src/healthscore"
import { useMutation } from 'react-query'
import { assetMapping } from '~/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callRecenterAll = async ({ program, userPubKey, setTxState, data }: CallRecenterProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('recenterAll data', data)

	await program.loadManager()

	const [cometResult, tokenDataResult] = await Promise.allSettled([program.getComet(), program.getTokenData()])

	if (cometResult.status === 'rejected' || tokenDataResult.status === 'rejected') {
		throw new Error('Network request was rejected');
	}

	const comet = cometResult.value
	const tokenData = tokenDataResult.value

	let calls = []
	let tickers = []

	for (let i = 0; i < Number(comet.numPositions); i++) {
		let position = comet.positions[i]
		let pool = tokenData.pools[Number(position.poolIndex)]
		const poolPrice = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
		const initPrice = toNumber(position.borrowedUsdi) / toNumber(position.borrowedIasset)
		const { tickerSymbol, ..._ } = assetMapping(Number(position.poolIndex))
		let recenterEstimation = calculateCometRecenterMultiPool(i, tokenData, comet)

		if (recenterEstimation.usdiCost > 0 && Math.abs(poolPrice - initPrice) / initPrice >= 0.001) {
			calls.push(program.recenterCometInstruction(i, 0))
			tickers.push(tickerSymbol)
		}
	}

	if (calls.length === 0) {
		throw new Error('No positions are able to be recentered!')
	}
	console.log("TICKERS:", tickers)
	let tx = new Transaction()

	let ixs = await Promise.all(calls);
	for (let ix of ixs) {
		tx.add(ix)
	}
	const resultMessage = tickers.length > 0 ? `The following positions were successfully recentered: ${tickers.join(', ')}.` : ''

	// await program.provider.sendAndConfirm!(tx)
	await sendAndConfirm(program, tx, setTxState)

	return {
		tickers,
		result: true,
		resultMessage
	}
}

export function useRecenterAllMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: RecenterFormData) => callRecenterAll({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation(() => funcNoWallet())
	}
}

export const callRecenter = async ({ program, userPubKey, setTxState, data }: CallRecenterProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('recenter data', data)

	await program.loadManager()

	// @TODO : change sendAndConfirm
	await program.recenterComet(data.positionIndex, 0)

	return {
		result: true,
	}
}

type RecenterFormData = {
	positionIndex: number
}

interface CallRecenterProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: RecenterFormData
}

export function useRecenterMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: RecenterFormData) => callRecenter({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: RecenterFormData) => funcNoWallet())
	}
}
