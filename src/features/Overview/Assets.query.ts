import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping } from '~/data/assets'
import { FilterType } from '~/data/filter'

export const fetchAssets = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
	if (!userPubKey) return []
    
	await program.loadManager()

	const iassetInfos = await program.getiAssetInfos()

	const result: AssetList[] = []

	for (const info of iassetInfos) {
		let { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(info[0])
		result.push({
			id: info[0],
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			price: info[1],
			assetType: assetType,
			liquidity: info[2],
			volume24h: 0, //coming soon
			baselineAPY: 0, //coming soon
		})
	}

  // const result: AssetList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     price: 160.51,
	//     liquidity: 2551,
	//     volume24h: 15898343,
	//     baselineAPY: 28.9
	//   },
	// ]
	return result
}

interface GetAssetsProps {
	userPubKey: PublicKey | null
	filter: FilterType
  searchTerm: string
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface AssetList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	price: number
	assetType: number
	liquidity: number
	volume24h: number
	baselineAPY: number
}

export function useAssetsQuery({ userPubKey, filter, searchTerm, refetchOnMount, enabled = true }: GetAssetsProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['assets', userPubKey, filter], () => fetchAssets({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled,
    select: (assets) => assets.filter((asset) => asset.tickerName.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tickerSymbol.toLowerCase().includes(searchTerm.toLowerCase()))
  })
}
