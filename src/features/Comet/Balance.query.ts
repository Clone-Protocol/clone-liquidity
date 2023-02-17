import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUSDiAccount } from '~/utils/token_accounts'

export const fetchBalance = async ({ program, userPubKey, setStartTimer }: { program: InceptClient, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
	if (!userPubKey) return null

  console.log('fetchBalance')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()

	let balanceVal = 0.0

	try {
    const associatedTokenAccount = await getUSDiAccount(program);
    const balance = await program.connection.getTokenAccountBalance(associatedTokenAccount!, "processed");
    balanceVal = Number(balance.value.amount) / 100000000;
	} catch {}

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
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(['cometBalance', userPubKey], () => fetchBalance({ program: getInceptApp(), userPubKey, setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}