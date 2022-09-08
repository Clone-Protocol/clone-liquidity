import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { assetMapping, collateralMapping, AssetType } from '~/data/assets'

export const fetchAssets = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
	if (!userPubKey) return []

	await program.loadManager()
	let mintInfos : any = []

	try {
		mintInfos = await program.getUserMintInfos()
	} catch (e) {
		console.error(e)
	}

	const result: AssetList[] = []

	let i = 0
	for (const info of mintInfos) {
    const { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(Number(info[0]))
    const { collateralName, collateralType } = collateralMapping(Number(info[1]))

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
			collateralRatio: info[5] * 100,
			minCollateralRatio: info[6] * 100,
		})
    i++
	}

	// const result2: AssetList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
  //     collateralName: 'USDi',
	//     oPrice: 160.51,
  //     assetType: 0,
  //     collateralType: 0,
	//     borrowed: 90.11,
	//     collateral: 111.48,
	//     collateralRatio: 15898343,
  //     minCollateralRatio: 120
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

export interface AssetList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	collateralName: string
	oPrice: number | Number
	assetType: number
	collateralType: number
	borrowed: number | Number
	collateral: number | Number
	collateralRatio: number | Number
	minCollateralRatio: number | Number
}

export function useBorrowQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetAssetsProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['borrowAssets', userPubKey, filter], () => fetchAssets({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled,
		select: (assets) => {
			return assets.filter((asset) => {
				if (filter === 'crypto') {
					return asset.assetType === AssetType.Crypto
				} else if (filter === 'fx') {
					return asset.assetType === AssetType.Fx
				} else if (filter === 'commodities') {
					return asset.assetType === AssetType.Commodities
				} else if (filter === 'stocks') {
					return asset.assetType === AssetType.Stocks
				}
				return true;
			})
		}
  })
}