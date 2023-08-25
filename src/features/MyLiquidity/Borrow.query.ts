import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { FilterType } from '~/data/filter'
import { assetMapping, collateralMapping, AssetType } from '~/data/assets'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUserMintInfos } from '~/utils/user'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchAssets = async ({ program, userPubKey }: { program: CloneClient, userPubKey: PublicKey | null }) => {
	if (!userPubKey) return []

	console.log('fetchPools :: Borrow.query')

	const result: AssetList[] = []

	const [poolsData, oraclesData, userAccountData] = await Promise.allSettled([
		program.getPools(), program.getOracles(), program.getUserAccount()
	]);

	if (poolsData.status === "fulfilled" && oraclesData.status === "fulfilled" && userAccountData.status === "fulfilled") {
		const mintInfos = getUserMintInfos(program, poolsData.value, oraclesData.value, userAccountData.value.borrows);

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
				collateralRatio: Number(info[5]) * 100,
				minCollateralRatio: Number(info[6]) * 100,
			})
			i++
		}
	}
	return result
}

interface GetAssetsProps {
	userPubKey: PublicKey | null
	filter: FilterType
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
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
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	if (wallet) {
		return useQuery(['borrowAssets', wallet, userPubKey, filter], async () => fetchAssets({ program: await getCloneApp(wallet), userPubKey }), {
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled,
			select: (assets) => {
				return assets.filter((asset) => {
					if (filter === 'crypto') {
						return asset.assetType === AssetType.Crypto
					} else if (filter === 'fx') {
						return asset.assetType === AssetType.Fx
					} else if (filter === 'commodities') {
						return asset.assetType === AssetType.Commodities
					}
					return true;
				})
			}
		})
	} else {
		return useQuery(['borrowAssets'], () => [])
	}
}