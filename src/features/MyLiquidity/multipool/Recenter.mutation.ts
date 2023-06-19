import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token'
import { CloneClient, toDevnetScale } from "incept-protocol-sdk/sdk/src/clone"
import { recenterProcedureInstructions } from "incept-protocol-sdk/sdk/src/utils"
import { Comet, TokenData } from 'incept-protocol-sdk/sdk/src/interfaces'
import { getTokenAccount, getOnUSDAccount } from '~/utils/token_accounts';
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
	// TODO: Can we remove this functionality?
	return;

	// console.log('recenterAll data', data)

	// await program.loadClone()

	// const [cometResult, tokenDataResult] = await Promise.allSettled([program.getComet(), program.getTokenData()])

	// if (cometResult.status === 'rejected' || tokenDataResult.status === 'rejected') {
	// 	throw new Error('Network request was rejected');
	// }

	// const comet = cometResult.value
	// const tokenData = tokenDataResult.value

	// let calls = []
	// let tickers = []

	// for (let i = 0; i < Number(comet.numPositions); i++) {
	// 	let position = comet.positions[i]
	// 	let pool = tokenData.pools[Number(position.poolIndex)]
	// 	const poolPrice = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
	// 	const initPrice = toNumber(position.borrowedUsdi) / toNumber(position.borrowedIasset)
	// 	const { tickerSymbol, ..._ } = assetMapping(Number(position.poolIndex))
	// 	let recenterEstimation = calculateCometRecenterMultiPool(i, tokenData, comet)

	// 	if (recenterEstimation.usdiCost > 0 && Math.abs(poolPrice - initPrice) / initPrice >= 0.001) {
	// 		calls.push(program.recenterCometInstruction(i, 0))
	// 		tickers.push(tickerSymbol)
	// 	}
	// }

	// if (calls.length === 0) {
	// 	throw new Error('No positions are able to be recentered!')
	// }
	// console.log("TICKERS:", tickers)
	// let tx = new Transaction()

	// let ixs = await Promise.all(calls);
	// for (let ix of ixs) {
	// 	tx.add(ix)
	// }
	// const resultMessage = tickers.length > 0 ? `The following positions were successfully recentered: ${tickers.join(', ')}.` : ''

	// // await program.provider.sendAndConfirm!(tx)
	// await sendAndConfirm(program, tx, setTxState)

	// return {
	// 	tickers,
	// 	result: true,
	// 	resultMessage
	// }
}

export function useRecenterAllMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: RecenterFormData) => callRecenterAll({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: RecenterFormData) => funcNoWallet())
	}
}

export const callRecenter = async ({ program, userPubKey, setTxState, data }: CallRecenterProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('recenter data', data)


	await program.loadClone()

	const [tokenData, comet] = await Promise.all([
		program.getTokenData(), program.getComet()
	]);
	const iassetMint = tokenData.pools[comet.positions[data.positionIndex].poolIndex].assetInfo.iassetMint
	let [usdiAddress, iassetAddress, usdiTreasuryAddress, iassetTreasuryAddress] = await Promise.all([
		getOnUSDAccount(program),
		getTokenAccount(
			iassetMint,
			userPubKey,
			program.provider.connection
		),
		getTokenAccount(
			program.incept!.usdiMint,
			program.incept!.treasuryAddress,
			program.provider.connection
		),
		getTokenAccount(
			iassetMint,
			program.incept!.treasuryAddress,
			program.provider.connection
		)
	])

	let ixnCalls: Promise<TransactionInstruction>[] = [];

	if (usdiAddress === undefined) {
		const ata = await getAssociatedTokenAddress(program.incept!.usdiMint, userPubKey);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, userPubKey, program.incept!.usdiMint))()
		)
		usdiAddress = ata
	}
	if (iassetAddress === undefined) {
		const ata = await getAssociatedTokenAddress(iassetMint, userPubKey);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, userPubKey, iassetMint))()
		)
		iassetAddress = ata
	}
	if (usdiTreasuryAddress === undefined) {
		const ata = await getAssociatedTokenAddress(program.incept!.usdiMint, program.incept!.treasuryAddress);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, program.incept!.treasuryAddress, program.incept!.usdiMint))()
		)
		usdiTreasuryAddress = ata
	}
	if (iassetTreasuryAddress === undefined) {
		const ata = await getAssociatedTokenAddress(program.incept!.usdiMint, program.incept!.treasuryAddress);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, program.incept!.treasuryAddress, iassetMint))()
		)
		iassetTreasuryAddress = ata
	}

	const recenterData = recenterProcedureInstructions(
		program, comet, tokenData, data.positionIndex, usdiAddress!, iassetAddress!, usdiTreasuryAddress!, iassetTreasuryAddress!
	)

	recenterData.ixs.forEach((call) => ixnCalls.push(call))

	let ixns = await Promise.all(ixnCalls)

	const addressLookupTablesPublicKey = new PublicKey(process.env.NEXT_PUBLIC_INCEPT_ADDRESS_LOOKUP_TABLE!)

	await sendAndConfirm(program.provider, ixns, setTxState, [], [addressLookupTablesPublicKey])
	return {
		result: true,
	}
}

type RecenterFormData = {
	positionIndex: number
}

interface CallRecenterProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: RecenterFormData
}

export function useRecenterMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: RecenterFormData) => callRecenter({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: RecenterFormData) => funcNoWallet())
	}
}
