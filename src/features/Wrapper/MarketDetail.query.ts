import { QueryObserverOptions, useQuery } from "@tanstack/react-query"
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { assetMapping } from "src/data/assets"
import { REFETCH_CYCLE } from "~/components/Common/DataLoadingIndicator"
import { getCloneClient } from "../baseQuery"
import { useAtomValue } from "jotai"
import { cloneClient, rpcEndpoint } from "../globalAtom"

export const fetchWrapperDetail = async ({
  index,
  mainCloneClient,
  networkEndpoint
}: {
  index: number
  mainCloneClient?: CloneClient | null
  networkEndpoint: string
}) => {
  let program: CloneClient
  if (mainCloneClient) {
    program = mainCloneClient
  } else {
    const { cloneClient: cloneProgram } = await getCloneClient(networkEndpoint)
    program = cloneProgram
  }

  const { tickerName, tickerSymbol, tickerIcon, pythSymbol } = assetMapping(index)

  //

  const marketDetail: MarketDetail = {
    tickerName,
    tickerSymbol,
    tickerIcon,
    pythSymbol,
  }

  return marketDetail
}

export const fetchWrapperDetailDefault = (): MarketDetail => {
  return {
    tickerName: "dARB",
    tickerSymbol: "dArb",
    pythSymbol: "FX.EUR/USD",
    tickerIcon: "",
  }
}

interface GetProps {
  index: number
  refetchOnMount?: QueryObserverOptions["refetchOnMount"]
  enabled?: boolean
}

export interface MarketDetail {
  tickerName: string
  tickerSymbol: string
  tickerIcon: string
  pythSymbol: string
}

export interface PairData {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
}

export function useWrapperDetailQuery({ index, refetchOnMount, enabled = true }: GetProps) {
  const mainCloneClient = useAtomValue(cloneClient)
  const networkEndpoint = useAtomValue(rpcEndpoint)
  let queryFunc
  try {
    queryFunc = () => fetchWrapperDetail({ index, mainCloneClient, networkEndpoint })
  } catch (e) {
    console.error(e)
    queryFunc = () => fetchWrapperDetailDefault()
  }

  return useQuery(["wrapperDetail", index], queryFunc, {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled,
  })
}
