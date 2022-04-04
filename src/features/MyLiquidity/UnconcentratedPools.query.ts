import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'

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

export const fetchPools = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
	if (!userPubKey) return []

	await program.loadManager()
	const iassetInfos = await program.getUserLiquidityInfos()

	const result: PoolList[] = []

	let i = 0

	for (var info of iassetInfos) {
		i++
		let tickerName = ''
		let tickerSymbol = ''
		let tickerIcon = ''
		let assetType: number
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
		result.push({
			id: i,
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			price: info[1],
			assetType: assetType,
			liquidityAsset: info[2],
			liquidityUSD: info[3],
			liquidityVal: info[3] * 2,
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
	// ]
	return result
}

interface GetPoolsProps {
	userPubKey: PublicKey | null
	filter: FilterType
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

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

export function useUnconcentPoolsQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetPoolsProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['unconcentPools', userPubKey, filter], () => fetchPools({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled
  })
}