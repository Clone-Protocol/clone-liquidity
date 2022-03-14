import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'

enum Collateral {
	USDi,
}

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

export const fetchAssets = async ({ program, userPubKey, filter }: GetPoolsProps) => {
	if (!userPubKey) return []

	await program.loadManager()
	const mintInfos = await program.getUserMintInfos()

	const result: AssetList[] = []

	let i = 0

	for (var info of mintInfos) {
		i++
		let tickerName = ''
		let collateralName = ''
		let tickerSymbol = ''
		let tickerIcon = ''
		let assetType: number
		let collateralType: number
		switch (Number(info[0])) {
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
		switch (Number(info[1])) {
			case Collateral.USDi:
				collateralName = 'USDi'
				collateralType = Collateral.USDi
				break
			default:
				throw new Error('Not supported')
		}
		result.push({
			id: i,
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			collateralName: collateralName,
			oPrice: info[2],
			assetType: assetType,
			collateralType: collateralType,
			borrowed: info[3],
			collateral: info[4],
			collateralRatio: info[5],
			minCollateralRatio: info[6],
		})
	}

	// const result: AssetList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     oPrice: 160.51,
	//     borrowed: 90.11,
	//     collateral: 111.48,
	//     collateralRatio: 15898343,
	//   },
	//   {
	//     id: 2,
	//     tickerName: 'iEthereum',
	//     tickerSymbol: 'iETH',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     oPrice: 2300.53,
	//     borrowed: 100.20,
	//     collateral: 90.11,
	//     collateralRatio: 111.48,
	//   }
	// ]
	return result
}

interface GetPoolsProps {
	program: Incept
	userPubKey: PublicKey | null
	filter: FilterType
}

export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'Crypto',
	'stocks' = 'Stocks',
	'fx' = 'FX',
	'commodities' = 'Commodities',
}
export type FilterType = keyof typeof FilterTypeMap

export interface AssetList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	collateralName: string
	oPrice: number
	assetType: number
	collateralType: number
	borrowed: number
	collateral: number
	collateralRatio: number
	minCollateralRatio: number
}
