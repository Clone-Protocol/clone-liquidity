import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { InceptClient, toDevnetScale } from 'incept-protocol-sdk/sdk/src/incept'
import { getUSDiAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callEdit = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	await program.loadManager()
	const userUsdiTokenAccount = await getUSDiAccount(program)

	const { collAmount, collIndex, editType } = data

	let ixnCalls: Promise<TransactionInstruction>[] = [program.updatePricesInstruction()];
	/// Deposit
	if (editType === 0) {
		ixnCalls.push(program.addCollateralToCometInstruction(userUsdiTokenAccount!, toDevnetScale(collAmount), 0))
		/// Withdraw
	} else {
		ixnCalls.push(
			program.withdrawCollateralFromCometInstruction(
				userUsdiTokenAccount!,
				toDevnetScale(collAmount),
				0,
		))
	}

	const ixns = await Promise.all(ixnCalls)

	await sendAndConfirm(program.provider, ixns, setTxState)

	return {
		result: true
	}
}

type EditFormData = {
	collIndex: number
	collAmount: number
	editType: number
}
interface CallEditProps {
	program: InceptClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
}
export function useCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}
