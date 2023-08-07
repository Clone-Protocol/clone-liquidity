import { useQuery, Query } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { assetMapping } from '~/data/assets'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { TokenData } from 'clone-protocol-sdk/sdk/generated/clone'
import { getAssociatedTokenAddress } from "@solana/spl-token";

const fetchIassetBalances = async (program: CloneClient, tokenData: TokenData): Promise<number[]> => {

	let balancesQueries = await Promise.allSettled(
		tokenData.pools.slice(0, tokenData.numPools.toNumber()).map(async (pool) => {
			let ata = await getAssociatedTokenAddress(
				pool.assetInfo.onassetMint,
				program.provider.publicKey!
			);
			let balance = await program.provider.connection.getTokenAccountBalance(
				ata
			);
			return balance.value.uiAmount !== null ? balance.value.uiAmount : 0;
		})
	);

	return balancesQueries.map((query) => {
		if (query.status === "rejected")
			return 0;

		return query.value!
	})
}

export const fetchAssets = async ({ program, userPubKey }: { program: CloneClient, userPubKey: PublicKey | null }) => {
	if (!userPubKey) return null
	console.log('fetchAssets')

	const tokenData = await program.getTokenData();
	const balances = await fetchIassetBalances(program, tokenData);

	const result: AssetList[] = []

	for (let index = 0; index < tokenData.numPools.toNumber(); index++) {
		let { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(index)
		result.push({
			id: index,
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			assetType: assetType,
			balance: balances[index],
		})
	}
	return result
}

interface GetAssetsProps {
	userPubKey: PublicKey | null
	enabled?: boolean
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
}

export interface AssetList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	assetType: number
	balance: number
}

export function useAssetsQuery({ userPubKey, enabled = true, refetchOnMount }: GetAssetsProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()

	if (wallet) {
		return useQuery(['assets', wallet, userPubKey], () => fetchAssets({ program: getCloneApp(wallet), userPubKey }), {
			refetchOnMount,
			enabled
		})
	} else {
		return useQuery(['assets'], () => [])
	}
}
