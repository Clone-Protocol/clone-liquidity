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

	let tx = new Transaction()
	let ix: TransactionInstruction
	/// Deposit
	if (editType === 0) {
		ix = await program.addCollateralToCometInstruction(userUsdiTokenAccount!, toDevnetScale(collAmount), 0)
		/// Withdraw
	} else {
		tx.add(await program.updatePricesInstruction())
		ix = await program.withdrawCollateralFromCometInstruction(
			userUsdiTokenAccount!,
			toDevnetScale(collAmount),
			0,
		)
	}
	tx.add(ix)

	// await program.provider.sendAndConfirm!(tx)
	await sendAndConfirm(program, tx, setTxState)

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
