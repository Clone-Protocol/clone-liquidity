import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'

enum Collateral {
	USDi,
	mockUSDC,
}

enum Asset {
	Euro,
	Gold,
	Solana,
	Ethereum,
	Bitcoin,
	Luna,
	Avalanche,
	Tesla,
	Apple,
	Amazon,
}
enum AssetType {
	Crypto,
	Stocks,
	Fx,
	Commodities,
}

export const fetchPools = async ({ program, userPubKey, filter }: GetPoolsProps) => {
	if (!userPubKey) return []

	await program.loadManager()
	const cometInfos = await program.getUserCometInfos()

	const result: PoolList[] = []

	let i = 0

	for (var info of cometInfos) {
		i++
		let tickerName = ''
		let collateralName = ''
		let tickerSymbol = ''
		let tickerIcon = ''
		let assetType: number
		let collateralType: number
		switch (Number(info[0])) {
			case Asset.Euro:
				tickerName = 'iEuro'
				tickerSymbol = 'iEUR'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Fx
				break
			case Asset.Gold:
				tickerName = 'iSPTSGD (GOLD INDEX)'
				tickerSymbol = 'iSPTSGD'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Commodities
				break
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
			case Asset.Bitcoin:
				tickerName = 'iBitcoin'
				tickerSymbol = 'iBTC'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Crypto
				break
			case Asset.Luna:
				tickerName = 'iLuna'
				tickerSymbol = 'iLUNA'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Crypto
				break
			case Asset.Avalanche:
				tickerName = 'iAvalanche'
				tickerSymbol = 'iAVAX'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Crypto
				break
			case Asset.Tesla:
				tickerName = 'iTesla'
				tickerSymbol = 'iTLSA'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Stocks
				break
			case Asset.Apple:
				tickerName = 'iApple'
				tickerSymbol = 'iAAPL'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Stocks
				break
			case Asset.Amazon:
				tickerName = 'iAmazon'
				tickerSymbol = 'iAMZN'
				tickerIcon = '/images/assets/ethereum-eth-logo.svg'
				assetType = AssetType.Stocks
				break
			default:
				throw new Error('Not supported')
		}
		switch (Number(info[1])) {
			case Collateral.USDi:
				collateralName = 'USDi'
				collateralType = Collateral.USDi
				break
			case Collateral.mockUSDC:
				collateralName = 'USDC'
				collateralType = Collateral.mockUSDC
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
			assetType: assetType,
			collateralType: collateralType,
			iPrice: Number(info[2]),
			cPrice: Number(info[3]),
			fromPriceRange: Number(info[4]),
			toPriceRange: Number(info[5]),
			collateral: Number(info[6]),
			ildIsIasset: Boolean(info[7]),
			ild: Number(info[8]),
			borrowedIasset: Number(info[9]),
			borrowedUsdi: Number(info[10]),
			liquidityTokenAmount: Number(info[11]),
		})
	}

	// const result: PoolList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     iPrice: 160.51,
	//     cPrice: 100.20,
	//     fromPriceRange: 90.11,
	//     toPriceRange: 111.48,
	//     collateral: 15898343,
	//     ild: 28.9
	//   },
	//   {
	//     id: 2,
	//     tickerName: 'iEthereum',
	//     tickerSymbol: 'iETH',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     iPrice: 2300.53,
	//     cPrice: 100.20,
	//     fromPriceRange: 90.11,
	//     toPriceRange: 111.48,
	//     collateral: 15898343,
	//     ild: 28.9
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

// export interface AssetsData {
//   list: AssetList[];
//   total: number;
// }

export interface PoolList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	collateralName: string
	assetType: number
	collateralType: number
	iPrice: number
	cPrice: number
	fromPriceRange: number
	toPriceRange: number
	collateral: number
	ildIsIasset: boolean
	ild: number
	borrowedIasset: number
	borrowedUsdi: number
	liquidityTokenAmount: number
}
