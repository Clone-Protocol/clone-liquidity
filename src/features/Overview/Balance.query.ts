import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getTokenAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchBalance = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
  if (!userPubKey) return null

  console.log('fetchBalance')

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

interface GetProps {
  userPubKey: PublicKey | null
  index: number
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface Balance {
  onusdVal: number
  onassetVal: number
}

export function useBalanceQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()

  if (wallet) {
    return useQuery(['borrowBalance', wallet, userPubKey, index], () => fetchBalance({ program: getCloneApp(wallet), userPubKey, index }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['borrowBalance'], () => ({ onusdVal: 0, onassetVal: 0 }))
  }
}