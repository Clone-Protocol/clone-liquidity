import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { InceptClient, toDevnetScale } from 'incept-protocol-sdk/sdk/src/incept'
import { getUSDiAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'

export const callEdit = async ({ program, userPubKey, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	await program.loadManager()
	const userUsdiTokenAccount = await getUSDiAccount(program)

	const { collAmount, collIndex, editType } = data

	let tx = new Transaction()
	let ix: TransactionInstruction
	/// Deposit
	if (editType === 0) {
		ix = await program.addCollateralToCometInstruction(userUsdiTokenAccount!, toDevnetScale(collAmount), 0, false)
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

	await program.provider.sendAndConfirm!(tx)

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
	data: EditFormData
}
export function useCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(wallet), userPubKey, data }))
	} else {
		return useMutation(() => funcNoWallet())
	}
}
