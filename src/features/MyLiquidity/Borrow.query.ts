import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { useIncept } from '~/hooks/useIncept'

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

export const fetchAssets = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
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
			case Asset.Euro:
				tickerName = 'iEuro'
				tickerSymbol = 'iEUR'
				tickerIcon = '/images/assets/euro.png'
				assetType = AssetType.Fx
				break
			case Asset.Gold:
				tickerName = 'iSPTSGD (GOLD INDEX)'
				tickerSymbol = 'iSPTSGD'
				tickerIcon = '/images/assets/gold.png'
				assetType = AssetType.Commodities
				break
			case Asset.Solana:
				tickerName = 'iSolana'
				tickerSymbol = 'iSOL'
				tickerIcon = '/images/assets/solana.png'
				assetType = AssetType.Crypto
				break
			case Asset.Ethereum:
				tickerName = 'iEthereum'
				tickerSymbol = 'iETH'
				tickerIcon = '/images/assets/ethereum.png'
				assetType = AssetType.Crypto
				break
			case Asset.Bitcoin:
				tickerName = 'iBitcoin'
				tickerSymbol = 'iBTC'
				tickerIcon = '/images/assets/bitcoin.png'
				assetType = AssetType.Crypto
				break
			case Asset.Luna:
				tickerName = 'iLuna'
				tickerSymbol = 'iLUNA'
				tickerIcon = '/images/assets/terra.png'
				assetType = AssetType.Crypto
				break
			case Asset.Avalanche:
				tickerName = 'iAvalanche'
				tickerSymbol = 'iAVAX'
				tickerIcon = '/images/assets/avalanche.png'
				assetType = AssetType.Crypto
				break
			case Asset.Tesla:
				tickerName = 'iTesla'
				tickerSymbol = 'iTLSA'
				tickerIcon = '/images/assets/tesla.png'
				assetType = AssetType.Stocks
				break
			case Asset.Apple:
				tickerName = 'iApple'
				tickerSymbol = 'iAAPL'
				tickerIcon = '/images/assets/apple.png'
				assetType = AssetType.Stocks
				break
			case Asset.Amazon:
				tickerName = 'iAmazon'
				tickerSymbol = 'iAMZN'
				tickerIcon = '/images/assets/amazon.png'
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
	// ]
	return result
}

interface GetAssetsProps {
	userPubKey: PublicKey | null
	filter: FilterType
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
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

export function useBorrowQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetAssetsProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['borrowAssets', userPubKey, filter], () => fetchAssets({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled
  })
}