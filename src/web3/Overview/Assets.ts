import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'

enum Asset {
	Solana,
	Ethereum,
}

enum AssetType {
	Crypto,
	Stocks,
	Fx,
	Comodotities,
}

export const fetchAssets = async ({ program, userPubKey, filter }: GetAssetsProps) => {
	if (!userPubKey) return []
	console.log('hi')
	await program.loadManager()
	console.log('hi')
	const iassetInfos = await program.getiAssetInfos()

	const result: AssetList[] = []

	for (var info of iassetInfos) {
		let tickerName = ''
		let tickerSymbol = ''
		let tickerIcon = ''
		let assetType: number
		switch (info[0]) {
			case Asset.Solana:
				tickerName = 'iSolana'
				tickerSymbol = 'iSOL'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Crypto
				break
			case Asset.Ethereum:
				tickerName = 'iEthereum'
				tickerSymbol = 'iETH'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Crypto
				break
			default:
				throw new Error('Not supported')
		}
		result.push({
			id: info[0],
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			price: info[1]!,
			assetType: assetType,
			liquidity: 0, //coming soon
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
	//   {
	//     id: 2,
	//     tickerName: 'iEthereum',
	//     tickerSymbol: 'iETH',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     price: 2300.53,
	//     liquidity: 2551,
	//     volume24h: 15898343,
	//     baselineAPY: 28.9
	//   }
	// ]
	return result
}

export const fetchAsset = async ({ program, userPubKey, index }: GetAssetProps) => {
	if (!userPubKey) return 

	await program.loadManager()
	const price = await program.getiAssetPrice(index)
	let tickerName = ''
	let tickerSymbol = ''
	let tickerIcon = ''
	let assetType: number
	switch (index) {
		case Asset.Solana:
			tickerName = 'iSolana'
			tickerSymbol = 'iSOL'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			assetType = AssetType.Crypto
			break
		case Asset.Ethereum:
			tickerName = 'iEthereum'
			tickerSymbol = 'iETH'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			assetType = AssetType.Crypto
			break
		default:
			throw new Error('Not supported')
	}
	return {
		id: index,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		tickerIcon: tickerIcon,
		price: price,
		assetType: assetType,
		liquidity: 0, //coming soon
		volume24h: 0, //coming soon
		baselineAPY: 0, //coming soon
	}
}

interface GetAssetsProps {
	program: Incept
	userPubKey: PublicKey | null
	filter: FilterType
}

interface GetAssetProps {
	program: Incept
	userPubKey: PublicKey | null
	index: number
}

export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'Crypto',
	'stocks' = 'Stocks',
	'fx' = 'FX',
	'commodities' = 'Commodities',
}
export type FilterType = keyof typeof FilterTypeMap

// export interface AssetsData {
//   list: AssetList[];
//   total: number;
// }

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
