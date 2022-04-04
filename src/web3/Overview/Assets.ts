import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { assetMapping } from '~/data/assets'
import { FilterType } from '~/data/filter'

export const fetchAssets = async ({ program, userPubKey, filter }: GetAssetsProps) => {
	if (!userPubKey) return []

	await program.loadManager()

	const iassetInfos = await program.getiAssetInfos()

	const result: AssetList[] = []

	for (var info of iassetInfos) {
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
	program: Incept
	userPubKey: PublicKey | null
	filter: FilterType
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
