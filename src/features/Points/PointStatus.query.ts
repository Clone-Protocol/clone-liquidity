import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { fetchUserPoints, UserPointsView } from '~/utils/fetch_netlify'

export const fetchStatus = async ({ program, userPubKey }: { program: CloneClient, userPubKey: PublicKey | null }) => {
  if (!userPubKey) return null

  console.log('fetchStatus')

  const userPoints: UserPointsView[] = await fetchUserPoints(userPubKey.toString())

  if (userPoints.length === 0) return null

  return {
    myRank: userPoints[0].rank,
    totalPoints: userPoints[0].total_points,
    lpPoints: userPoints[0].lp_points,
    tradePoints: userPoints[0].trading_points,
    socialPoints: userPoints[0].social_points
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface Status {
  myRank: number
  totalPoints: number
  lpPoints: number
  tradePoints: number
  socialPoints: number
}

export function usePointStatusQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()

  if (wallet) {
    return useQuery(['statusData', wallet, userPubKey], async () => fetchStatus({ program: await getCloneApp(wallet), userPubKey }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['statusData'], () => { return null })
  }
}