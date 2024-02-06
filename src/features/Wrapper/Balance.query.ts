import { QueryObserverOptions, useQuery } from '@tanstack/react-query'
import { CLONE_TOKEN_SCALE, CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { PublicKey } from '@solana/web3.js'
import { useClone } from '~/hooks/useClone'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from "~/data/assets";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getTokenAccount } from '~/utils/token_accounts'

export const fetchBalance = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return null

	console.log('fetchBalance :: Balance.query')

	const { underlyingTokenMint } = assetMapping(index);

	const tokenAccount = await getAssociatedTokenAddress(underlyingTokenMint, userPubKey);

	let underlyingAssetVal = 0.0
	let maxUnwrappableVal = 0.0
	try {
		underlyingAssetVal = (await program.provider.connection.getTokenAccountBalance(tokenAccount)).value.uiAmount!;
	} catch (e) {
		console.error(e)
	}

	let onassetVal = 0.0
	const cloneConversionFactor = Math.pow(10, -CLONE_TOKEN_SCALE)
	const pools = await program.getPools();
	const pool = pools.pools[index];
	const onassetTokenAccountInfo = await getTokenAccount(pool.assetInfo.onassetMint, userPubKey, program.provider.connection);
	if (onassetTokenAccountInfo.isInitialized) {
		const iassetBalance = await program.provider.connection.getTokenAccountBalance(onassetTokenAccountInfo.address, "processed");
		onassetVal = Number(iassetBalance.value.amount) * cloneConversionFactor;
	}

	return {
		underlyingAssetVal,
		maxUnwrappableVal,
		onassetVal
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index?: number
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export interface WrapperBalance {
	underlyingAssetVal: number
	maxUnwrappableVal: number
	onassetVal: number
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
		return useQuery(['wrapperBalance'], () => ({ underlyingAssetVal: 0, maxUnwrappableVal: 0, onassetVal: 0 }))
	}
}
