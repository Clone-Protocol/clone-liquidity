import { useQuery, Query } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping } from '~/data/assets'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { TokenData } from "incept-protocol-sdk/sdk/src/interfaces"
import { getAssociatedTokenAddress } from "@solana/spl-token";


const fetchIassetBalances = async (program: InceptClient, tokenData: TokenData): Promise<number[]> => {

	let balancesQueries = await Promise.allSettled(
		tokenData.pools.slice(0, tokenData.numPools.toNumber()).map(async (pool) => {
		  let ata = await getAssociatedTokenAddress(
			pool.assetInfo.iassetMint,
			program.provider.publicKey!
		  );
		  let balance = await program.provider.connection.getTokenAccountBalance(
			ata
		  );
		  return balance.value.uiAmount !== null ? balance.value.uiAmount: 0;
		})
	  );
	
	return balancesQueries.map((query) => {
		if (query.status === "rejected") 
			return 0;

		return query.value!
	})
}

export const fetchAssets = async ({ program, userPubKey }: { program: InceptClient, userPubKey: PublicKey | null }) => {
	if (!userPubKey) return null
	console.log('fetchAssets')

	await program.loadManager()
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
	const { getInceptApp } = useIncept()

	if (wallet) {
		return useQuery(['assets', wallet, userPubKey], () => fetchAssets({ program: getInceptApp(wallet), userPubKey }), {
			refetchOnMount,
			enabled
		})
	} else {
		return useQuery(['assets'], () => [])
	}
}
