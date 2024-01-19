import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { PublicKey } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from "~/data/assets";
import { getAssociatedTokenAddress } from '@solana/spl-token';

export const fetchBalance = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return null

	console.log('fetchBalance')

	const { underlyingTokenMint } = assetMapping(index);

	const tokenAccount = await getAssociatedTokenAddress(underlyingTokenMint, userPubKey);

	let underlyingAssetVal = 0.0
	try {
		underlyingAssetVal = (await program.provider.connection.getTokenAccountBalance(tokenAccount)).value.uiAmount!;
	} catch (e) {
		console.error(e)
	}

	return {
		underlyingAssetVal
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index?: number
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export interface Balance {
	underlyingAssetVal: number
}

export function useBalanceQuery({ userPubKey, index = -1, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()

	if (wallet) {
		return useQuery(['wrapperBalance', wallet, userPubKey, index], async () => fetchBalance({ program: await getCloneApp(wallet), userPubKey, index }), {
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled
		})
	} else {
		return useQuery(['wrapperBalance'], () => ({ underlyingAssetVal: 0 }))
	}
}
