import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

enum Collateral {
	mockUSDC,
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
    switch (info[1]) {
			case Collateral.mockUSDC:
				collateralName = 'mockUSDC'
				collateralType = Collateral.mockUSDC
				break
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
      borrowed: info[4],
      collateral: info[5],
      collateralRatio: info[6],
      minCollateralRatio: info[7]
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

export const fetchAsset = async ({ program, userPubKey, index }: GetPoolProps) => {
	if (!userPubKey) return 

	await program.loadManager()
	const data = await program.getMintiAssetData(index)
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
		assetType: assetType,
		aPrice: data[0],
		oPrice: data[1],
		stableCollateralRatio: data[2],
		cryptoCollateralRatio: data[3]
	}
}

interface GetPoolsProps {
  program: Incept,
  userPubKey: PublicKey | null,
  filter: FilterType,
}

interface GetPoolProps {
	program: Incept,
	userPubKey: PublicKey | null,
	index: number,
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
export interface MintAsset {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	assetType: number
	aPrice: number
	oPrice: number
	stableCollateralRatio: number
	cryptoCollateralRatio: number
  }