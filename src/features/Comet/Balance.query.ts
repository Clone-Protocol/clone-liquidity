import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getOnUSDAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchBalance = async ({ program, userPubKey, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return null

  console.log('fetchBalance - onUSD')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadClone()

  let balanceVal = 0.0

  try {
    const associatedTokenAccount = await getOnUSDAccount(program);
    const balance = await program.connection.getTokenAccountBalance(associatedTokenAccount!, "processed");
    balanceVal = Number(balance.value.amount) / 100000000;
  } catch { }

  return {
    balanceVal: balanceVal,
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface Balance {
  balanceVal: number
}

export function useBalanceQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['cometBalance', wallet, userPubKey], () => fetchBalance({ program: getCloneApp(wallet), userPubKey, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['cometBalance'], () => ({ balanceVal: 0 }))
  }
}