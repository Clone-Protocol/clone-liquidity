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

  await program.loadClone()

  let onusdVal = 0.0
  let onassetVal = 0.0

  const onusdTokenAccountAddress = await getTokenAccount(program.clone!.onusdMint, userPubKey, program.connection);

  if (onusdTokenAccountAddress !== undefined) {
    const onusdBalance = await program.connection.getTokenAccountBalance(onusdTokenAccountAddress, "processed");
    onusdVal = Number(onusdBalance.value.amount) / 100000000;
  }

  // if not default index
  if (index !== -1) {
    const tokenData = await program.getTokenData();

    const pool = tokenData.pools[index];
    const onassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.onassetMint, userPubKey, program.connection);
    if (onassetTokenAccountAddress !== undefined) {
      const onassetBalance = await program.connection.getTokenAccountBalance(onassetTokenAccountAddress, "processed");
      onassetVal = Number(onassetBalance.value.amount) / 100000000;
    }
  }

  return {
    onusdVal,
    onassetVal
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  index?: number
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface Balance {
  onusdVal: number
  onassetVal: number
}

export function useBalanceQuery({ userPubKey, index = -1, refetchOnMount, enabled = true }: GetProps) {
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