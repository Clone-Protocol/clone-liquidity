import { Query, useQuery } from "@tanstack/react-query"
import { PublicKey } from "@solana/web3.js"
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from "~/hooks/useClone"
import { REFETCH_CYCLE } from "~/components/Common/DataLoadingIndicator"
import { getAggregatedPoolStats, getiAssetInfos } from '~/utils/assets';
import { assetMapping } from "~/data/assets"
import { useAnchorWallet } from "@solana/wallet-adapter-react"

export const fetchPools = async ({
  program,
  userPubKey,
  noFilter,
}: {
  program: CloneClient
  userPubKey: PublicKey | null
  noFilter: boolean
}) => {
  if (!userPubKey) return []
  console.log("fetchPools :: LiquidityPools.query")

  const [poolsData, oraclesData, userAccountData] = await Promise.allSettled([
    program.getPools(),
    program.getOracles(),
    program.getUserAccount(),
  ])
  if (poolsData.status === "rejected" || oraclesData.status === "rejected" || userAccountData.status === "rejected") {
    throw new Error("Couldn't fetch data!")
  }
  const pools = poolsData.value
  const oracles = oraclesData.value
  const comet = userAccountData.value.comet
  const assetInfos = await getiAssetInfos(program.provider.connection, program, pools, oracles)
  const poolStats = await getAggregatedPoolStats(pools)
  const currentPoolSet = new Set()

  for (let i = 0; i < Number(comet.positions.length); i++) {
    const poolIndex = Number(comet.positions[i].poolIndex)
    currentPoolSet.add(poolIndex)
  }

  const result = []
  for (const asset of assetInfos) {
    if (!noFilter && currentPoolSet.has(asset.poolIndex)) {
      continue
    }
    const { tickerIcon, tickerSymbol, tickerName } = assetMapping(asset.poolIndex)
    const stats = poolStats[asset.poolIndex]
    result.push({
      id: asset.poolIndex,
      tickerName,
      tickerSymbol,
      tickerIcon,
      totalLiquidity: asset.liquidity,
      volume24H: stats.volumeUSD,
      averageAPY: 0,
      isEnabled: true,
    })
  }

  return result
}

interface GetPoolsProps {
  userPubKey: PublicKey | null
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
  noFilter?: boolean
}

export interface PoolList {
  id: number
  tickerSymbol: string
  tickerIcon: string
  totalLiquidity: number
  volume24H: number
  averageAPY: number
  isEnabled: boolean
}

export function useLiquidityPoolsQuery({
  userPubKey,
  refetchOnMount,
  enabled = true,
  noFilter = true,
}: GetPoolsProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()

  if (wallet) {
    return useQuery(
      ["liquidityPools", wallet, userPubKey],
      async () => fetchPools({ program: await getCloneApp(wallet), userPubKey, noFilter }),
      {
        refetchOnMount,
        refetchInterval: REFETCH_CYCLE,
        refetchIntervalInBackground: true,
        enabled,
      }
    )
  } else {
    return useQuery(["liquidityPools"], () => [])
  }
}
