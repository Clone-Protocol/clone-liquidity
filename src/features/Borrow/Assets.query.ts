import { useQuery, Query } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping } from '~/data/assets'
import { getiAssetInfos } from '~/utils/assets';

export const fetchAssets = async ({ program, userPubKey }: { program: InceptClient, userPubKey: PublicKey | null }) => {
	if (!userPubKey) return null
	console.log('fetchAssets')

	await program.loadManager()
	const tokenData = await program.getTokenData();
	const iassetInfos = getiAssetInfos(tokenData);

	const result: AssetList[] = []

	for (const info of iassetInfos) {
		let { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(info[0])
		result.push({
			id: info[0],
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			assetType: assetType,
			balance: 0, // @TODO: set proper balance
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
	const { getInceptApp } = useIncept()

	return useQuery(['assets', userPubKey], () => fetchAssets({ program: getInceptApp(), userPubKey }), {
		refetchOnMount,
		enabled
	})
}
