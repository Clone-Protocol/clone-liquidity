import { Query, useQuery } from "react-query"
import { PublicKey } from "@solana/web3.js"
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from "~/hooks/useClone"
import { useDataLoading } from "~/hooks/useDataLoading"
import { REFETCH_CYCLE } from "~/components/Common/DataLoadingIndicator"
import { getAggregatedPoolStats, getiAssetInfos } from '~/utils/assets';
import { assetMapping } from "~/data/assets"
import { useAnchorWallet } from "@solana/wallet-adapter-react"

export const fetchPools = async ({
  program,
  userPubKey,
  setStartTimer,
  noFilter,
}: {
  program: CloneClient
  userPubKey: PublicKey | null
  setStartTimer: (start: boolean) => void
  noFilter: boolean
}) => {
  if (!userPubKey) return []

  await program.loadClone()

  console.log("fetchPools :: LiquidityPools.query")
  // start timer in data-loading-indicator
  setStartTimer(false)
  setStartTimer(true)

  const [tokenDataResult, cometResult] = await Promise.allSettled([
    program.getTokenData(),
    program.getComet(),
  ])
  if (tokenDataResult.status === "rejected" || cometResult.status === "rejected") {
    throw new Error("Couldn't fetch data!")
  }
  const tokenData = tokenDataResult.value
  const comet = cometResult.value
  const assetInfos = getiAssetInfos(tokenData)
  const poolStats = await getAggregatedPoolStats(tokenData)

  let currentPoolSet = new Set()

  for (let i = 0; i < Number(comet.numPositions); i++) {
    const poolIndex = Number(comet.positions[i].poolIndex)
    currentPoolSet.add(poolIndex)
  }

  let result = []

  for (let asset of assetInfos) {
    if (!noFilter && currentPoolSet.has(asset.poolIndex)) {
      continue
    }
    let { tickerIcon, tickerSymbol, tickerName } = assetMapping(asset.poolIndex)
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
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(
      ["liquidityPools", wallet, userPubKey],
      () => fetchPools({ program: getCloneApp(wallet), userPubKey, setStartTimer, noFilter }),
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
