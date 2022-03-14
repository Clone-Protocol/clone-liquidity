import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

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

export const fetchPools = async ({ program, userPubKey, filter }: GetPoolsProps) => {
  if (!userPubKey) return []

  await program.loadManager()
  const iassetInfos = await program.getUserLiquidityInfos()

	const result: PoolList[] = []

  let i = 0

  console.log(iassetInfos)

	for (var info of iassetInfos) {
    i++
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
			id: i,
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			price: info[1],
			assetType: assetType,
      liquidityAsset: info[2], 
      liquidityUSD: info[3],
      liquidityVal: info[4]
		})
	}

  // const result: PoolList[] = [
  //   {
  //     id: 1,
  //     tickerName: 'iSolana',
  //     tickerSymbol: 'iSOL',
  //     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
  //     price: 160.51,
  //     liquidityAsset: 90.11,
  //     liquidityUSD: 111.48,
  //     liquidityVal: 15898343,
  //   },
  //   {
  //     id: 2,
  //     tickerName: 'iEthereum',
  //     tickerSymbol: 'iETH',
  //     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
  //     price: 2300.53,
  //     liquidityAsset: 100.20,
  //     liquidityUSD: 90.11,
  //     liquidityVal: 111.48,
  //   }
  // ]
  return result
}

interface GetPoolsProps {
  program: Incept,
  userPubKey: PublicKey | null,
  filter: FilterType
}

export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'Crypto',
	'stocks' = 'Stocks',
	'fx' = 'FX',
  'commodities' = 'Commodities'
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
  price: number
  assetType: number
  liquidityAsset: number
  liquidityUSD: number
  liquidityVal: number
}