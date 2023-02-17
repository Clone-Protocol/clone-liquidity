import { Query, useQuery } from "react-query"
import { PublicKey } from "@solana/web3.js"
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from "~/hooks/useIncept"
import { useDataLoading } from "~/hooks/useDataLoading"
import { REFETCH_CYCLE } from "~/components/Common/DataLoadingIndicator"
import { getiAssetInfos } from "~/utils/assets"
import { assetMapping } from "~/data/assets"

export const fetchPools = async ({
  program,
  userPubKey,
  setStartTimer,
  noFilter,
}: {
  program: InceptClient
  userPubKey: PublicKey | null
  setStartTimer: (start: boolean) => void
  noFilter: boolean
}) => {
  if (!userPubKey) return []

  await program.loadManager()

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

  let currentPoolSet = new Set()

  for (let i = 0; i < Number(comet.numPositions); i++) {
    const poolIndex = Number(comet.positions[i].poolIndex)
    currentPoolSet.add(poolIndex)
  }

  let result = []

  for (let asset of assetInfos) {
    if (!noFilter && currentPoolSet.has(asset[0])) {
      continue
    }
    let { tickerIcon, tickerSymbol, tickerName } = assetMapping(asset[0])
    result.push({
      id: asset[0],
      tickerName,
      tickerSymbol,
      tickerIcon,
      totalLiquidity: asset[2],
      volume24H: 0,
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
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(
    ["liquidityPools", userPubKey],
    () => fetchPools({ program: getInceptApp(), userPubKey, setStartTimer, noFilter }),
    {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled,
    }
  )
}
