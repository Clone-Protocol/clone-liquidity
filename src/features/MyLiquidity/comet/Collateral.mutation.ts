import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useMutation } from '@tanstack/react-query'
import { CloneClient, toScale } from 'clone-protocol-sdk/sdk/src/clone'
import { getCollateralAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';
import { useAtomValue } from 'jotai'
import { priorityFee } from '~/features/globalAtom'
import { FeeLevel } from '~/data/networks'

export const callEdit = async ({ program, userPubKey, setTxState, data, feeLevel }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	const collateralAssociatedTokenAccount = await getCollateralAccount(program)
	const collateralTokenAccountInfo = await getCollateralAccount(program)

	const { collAmount, editType } = data
	const oracles = await program.getOracles();

	const ixnCalls: TransactionInstruction[] = [program.updatePricesInstruction(oracles)];
	if (editType === 0) {
		ixnCalls.push(
			program.addCollateralToCometInstruction(
				collateralTokenAccountInfo.address,
				toScale(collAmount, program.clone.collateral.scale)
			))
	} else {
		ixnCalls.push(
			program.withdrawCollateralFromCometInstruction(
				collateralAssociatedTokenAccount.address,
				toScale(collAmount, program.clone.collateral.scale)
			))
	}

	const ixns = await Promise.all(ixnCalls)
	await sendAndConfirm(program.provider, ixns, setTxState, feeLevel)

	return {
		result: true
	}
}

type EditFormData = {
	collAmount: number
	editType: number
}
interface CallEditProps {
	program: CloneClient
	userPubKey: PublicKey | null
	setTxState: (state: TransactionStateType) => void
	data: EditFormData
	feeLevel: FeeLevel
}
export function useCollateralMutation(userPubKey: PublicKey | null) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()
	const feeLevel = useAtomValue(priorityFee)

	if (wallet) {
		return useMutation(async (data: EditFormData) => callEdit({ program: await getCloneApp(wallet), userPubKey, setTxState, data, feeLevel }))
	} else {
		return useMutation((_: EditFormData) => funcNoWallet())
	}
}
