import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useMutation } from '@tanstack/react-query'
import { CloneClient, toDevnetScale } from 'clone-protocol-sdk/sdk/src/clone'
import { getOnUSDAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callEdit = async ({ program, userPubKey, setTxState, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	const userUsdiTokenAccount = await getOnUSDAccount(program)

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
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
}
export function useCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: EditFormData) => callEdit({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}
