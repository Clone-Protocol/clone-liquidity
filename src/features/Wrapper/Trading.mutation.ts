import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { useMutation } from '@tanstack/react-query'
import { useClone } from '~/hooks/useClone'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper'
import { useAtomValue } from 'jotai'
import { funcNoWallet } from '~/features/baseQuery'
import { FeeLevel } from '~/data/networks'
import { priorityFee } from '~/features/globalAtom'
import { AnchorProvider } from '@coral-xyz/anchor'

export const callTrading = async ({
	program,
	userPubKey,
	setTxState,
	data,
	feeLevel,
}: CallTradingProps) => {
	if (!userPubKey) throw new Error('no user public key')

	let {
		quantity,
		poolIndex,
	} = data
	quantity = Number(quantity)

	console.log('input data', data)

	let ixns: TransactionInstruction[] = []

	//

	await sendAndConfirm(program.provider as AnchorProvider, ixns, setTxState, feeLevel)
	return {
		result: true
	}
}

type FormData = {
	quantity: number,
	poolIndex: number,
}
interface CallTradingProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: FormData
	feeLevel: FeeLevel
}
export function useTradingMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()
	const feeLevel = useAtomValue(priorityFee)

	if (wallet) {
		return useMutation(async (data: FormData) => callTrading({ program: await getCloneApp(wallet), userPubKey, setTxState, data, feeLevel }))
	} else {
		return useMutation((_: FormData) => funcNoWallet())
	}
}