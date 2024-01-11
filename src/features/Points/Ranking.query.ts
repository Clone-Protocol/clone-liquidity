import { Query, useQuery } from '@tanstack/react-query'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { fetchUserPoints } from '~/utils/fetch_netlify'

export const fetchRanking = async () => {
  console.log('fetchRanking')

  let userPoints = await fetchUserPoints()
  let result: RankingList[] = []

  userPoints = userPoints.slice(0, 100)
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
  user: { name: string | undefined, address: string }
  lpPoints: number
  tradePoints: number
  socialPoints: number
  totalPoints: number
}

export function useRankingQuery({ refetchOnMount, enabled = true }: GetProps) {
  let queryFunc
  try {
    queryFunc = () => fetchRanking()
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
