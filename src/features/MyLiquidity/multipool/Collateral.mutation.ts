import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { Incept, toDevnetScale } from 'incept-protocol-sdk/sdk/src/incept'
import { getUSDiAccount } from '~/utils/token_accounts'

export const callEdit = async ({ program, userPubKey, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	await program.loadManager()
	const userUsdiTokenAccount = await getUSDiAccount(program)

	// TODO: params need to be changed
	const { collAmount, mintAmountChange, cometIndex, editType } = data
	let tx = new Transaction()
	let ix: TransactionInstruction
	/// Deposit
	if (editType === 0) {
		ix = await program.addCollateralToCometInstruction(userUsdiTokenAccount!, toDevnetScale(collAmount), 0, false)
		/// Withdraw
	} else {
		ix = await program.withdrawCollateralFromCometInstruction(
			userUsdiTokenAccount!,
			toDevnetScale(collAmount),
			0,
			false
		)
	}
	tx.add(ix)

	await program.provider.send!(tx)
}

type EditFormData = {
	cometIndex: number
	collAmount: number
	mintAmountChange: number
	editType: number
}
interface CallEditProps {
	program: Incept
	userPubKey: PublicKey | null
	data: EditFormData
}
export function useCollateralMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(), userPubKey, data }))
}
