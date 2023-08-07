// @Deprecated
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { recenterProcedureInstructions } from "clone-protocol-sdk/sdk/src/utils"
import { getTokenAccount, getOnUSDAccount } from '~/utils/token_accounts';
import { useMutation } from '@tanstack/react-query'
import { useClone } from '~/hooks/useClone'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { funcNoWallet } from '~/features/baseQuery'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export const callRecenter = async ({ program, userPubKey, setTxState, data }: CallRecenterProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('recenter data', data)

	const [tokenData, comet] = await Promise.all([
		program.getTokenData(), program.getComet()
	]);
	const iassetMint = tokenData.pools[comet.positions[data.positionIndex].poolIndex].assetInfo.onassetMint
	let [usdiAddress, iassetAddress, usdiTreasuryAddress, iassetTreasuryAddress] = await Promise.all([
		getOnUSDAccount(program),
		getTokenAccount(
			iassetMint,
			userPubKey,
			program.provider.connection
		),
		getTokenAccount(
			program.clone!.onusdMint,
			program.clone!.treasuryAddress,
			program.provider.connection
		),
		getTokenAccount(
			iassetMint,
			program.clone!.treasuryAddress,
			program.provider.connection
		)
	])

	let ixnCalls: Promise<TransactionInstruction>[] = [];

	if (usdiAddress === undefined) {
		const ata = await getAssociatedTokenAddress(program.clone!.onusdMint, userPubKey);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, userPubKey, program.clone!.onusdMint))()
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
		const ata = await getAssociatedTokenAddress(program.clone!.onusdMint, program.clone!.treasuryAddress);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, program.clone!.treasuryAddress, program.clone!.onusdMint))()
		)
		usdiTreasuryAddress = ata
	}
	if (iassetTreasuryAddress === undefined) {
		const ata = await getAssociatedTokenAddress(program.clone!.onusdMint, program.clone!.treasuryAddress);
		ixnCalls.push(
			(async () => createAssociatedTokenAccountInstruction(userPubKey, ata, program.clone!.treasuryAddress, iassetMint))()
		)
		iassetTreasuryAddress = ata
	}

	const recenterData = recenterProcedureInstructions(
		program, comet, tokenData, data.positionIndex, usdiAddress!, iassetAddress!, usdiTreasuryAddress!, iassetTreasuryAddress!
	)

	recenterData.ixs.forEach((call) => ixnCalls.push(call))

	let ixns = await Promise.all(ixnCalls)

	const addressLookupTablesPublicKey = new PublicKey(process.env.NEXT_PUBLIC_CLONE_ADDRESS_LOOKUP_TABLE!)

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
	const { getCloneApp } = useClone()
	const { setTxState } = useTransactionState()

	if (wallet) {
		return useMutation((data: RecenterFormData) => callRecenter({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
	} else {
		return useMutation((_: RecenterFormData) => funcNoWallet())
	}
}
