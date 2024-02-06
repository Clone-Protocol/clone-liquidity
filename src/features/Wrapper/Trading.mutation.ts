import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { CloneClient, toScale } from 'clone-protocol-sdk/sdk/src/clone'
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
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { assetMapping } from "~/data/assets";
import { getTokenAccount } from '~/utils/token_accounts';

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
		isWrap
	} = data
	quantity = Number(quantity)

	if (isWrap) {
		let ixns: TransactionInstruction[] = []

		const pools = await program.getPools()
		const pool = pools.pools[poolIndex]
		const { underlyingTokenMint } = assetMapping(poolIndex);
		const underlyingMintDecimal = await getMint(program.provider.connection, underlyingTokenMint).then(mint => mint.decimals)
		const userAssetAta = await getAssociatedTokenAddress(underlyingTokenMint, userPubKey);
		const userclAssetAta = await getTokenAccount(
			pool.assetInfo.onassetMint,
			program.provider.publicKey!,
			program.provider.connection
		)

		// Check if the user has a clAsset ata
		if (!userclAssetAta.isInitialized) {
			ixns.push(
				createAssociatedTokenAccountInstruction(
					program.provider.publicKey!,
					userclAssetAta.address,
					program.provider.publicKey!,
					pool.assetInfo.onassetMint
				)
			)
		}
		// Create wrap instruction
		ixns.push(
			program.wrapAssetInstruction(
				pools,
				toScale(quantity, underlyingMintDecimal),
				poolIndex,
				underlyingTokenMint,
				userAssetAta,
				userclAssetAta.address
			)
		)

		await sendAndConfirm(program.provider as AnchorProvider, ixns, setTxState, feeLevel)
	} else {
		// @TODO : for unwrap
	}

	return {
		result: true
	}
}

type FormData = {
	quantity: number,
	isWrap: boolean,
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