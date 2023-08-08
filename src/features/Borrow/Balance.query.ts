import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getOnUSDAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { getTokenAccount } from '~/utils/token_accounts'

export const fetchBalance = async ({ program, userPubKey, index, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return null

  console.log('fetchBalance')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  let onusdVal = 0.0
  let onassetVal = 0.0

  const onusdTokenAccountAddress = await getTokenAccount(program.clone!.onusdMint, userPubKey, program.provider.connection);

  if (onusdTokenAccountAddress !== undefined) {
    const onusdBalance = await program.provider.connection.getTokenAccountBalance(onusdTokenAccountAddress, "processed");
    onusdVal = Number(onusdBalance.value.amount) / 100000000;
  }
  const tokenData = await program.getTokenData();

  const pool = tokenData.pools[index];
  const onassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.onassetMint, userPubKey, program.provider.connection);
  if (onassetTokenAccountAddress !== undefined) {
    const onassetBalance = await program.provider.connection.getTokenAccountBalance(onassetTokenAccountAddress, "processed");
    onassetVal = Number(onassetBalance.value.amount) / 100000000;
  }

  return {
    onusdVal,
    onassetVal
  }
}

export const fetchBalances = async ({ program, userPubKey, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return null

  console.log('fetchBalance - onUSD')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  let balanceVal = 0.0

  try {
    const associatedTokenAccount = await getOnUSDAccount(program);
    const balance = await program.provider.connection.getTokenAccountBalance(associatedTokenAccount!, "processed");
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
  const { getCloneApp } = useClone()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['cometBalance', wallet, userPubKey], async () => fetchBalances({ program: await getCloneApp(wallet), userPubKey, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['cometBalance'], () => ({ balanceVal: 0 }))
  }
}