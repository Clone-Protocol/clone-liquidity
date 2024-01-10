import { Query, useQuery } from '@tanstack/react-query'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { useAtomValue } from 'jotai'
import { getCloneClient } from '../baseQuery';
import { cloneClient, rpcEndpoint } from '../globalAtom'
import { fetchUserPoints, UserPointsView } from '~/utils/fetch_netlify'

export const fetchRanking = async ({ mainCloneClient, networkEndpoint }: { mainCloneClient?: CloneClient | null, networkEndpoint: string }) => {
  console.log('fetchRanking')

  const userPoints = await fetchUserPoints()
  let result: RankingList[] = []

  userPoints.forEach((user, id) => {
    result.push({
      id,
      rank: user.rank,
      user: { name: user.name, address: user.user_address },
      lpPoints: user.lp_points,
      tradePoints: user.trading_points,
      socialPoints: user.social_points,
      totalPoints: user.total_points
    })
  });

  return result
}

interface GetProps {
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface RankingList {
  id: number
  rank: number
  user: {name: string | undefined, address: string }
  lpPoints: number
  tradePoints: number
  socialPoints: number
  totalPoints: number
}

export function useRankingQuery({ refetchOnMount, enabled = true }: GetProps) {
  const mainCloneClient = useAtomValue(cloneClient)
  const networkEndpoint = useAtomValue(rpcEndpoint)

  let queryFunc
  try {
    queryFunc = () => fetchRanking({ mainCloneClient, networkEndpoint })
  } catch (e) {
    console.error(e)
    queryFunc = () => []
  }

  return useQuery(['ranks'], queryFunc, {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}
