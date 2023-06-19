import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getTokenAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchBalance = async ({ program, userPubKey, index, setStartTimer }: { program: CloneClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
  if (!userPubKey) return null

  console.log('fetchBalance')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadClone()

  let usdiVal = 0.0
  let iassetVal = 0.0

  const usdiTokenAccountAddress = await getTokenAccount(program.incept!.usdiMint, userPubKey, program.connection);

  if (usdiTokenAccountAddress !== undefined) {
    const usdiBalance = await program.connection.getTokenAccountBalance(usdiTokenAccountAddress, "processed");
    usdiVal = Number(usdiBalance.value.amount) / 100000000;
  }
  const tokenData = await program.getTokenData();

  const pool = tokenData.pools[index];
  const iassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.iassetMint, userPubKey, program.connection);
  if (iassetTokenAccountAddress !== undefined) {
    const iassetBalance = await program.connection.getTokenAccountBalance(iassetTokenAccountAddress, "processed");
    iassetVal = Number(iassetBalance.value.amount) / 100000000;
  }

  return {
    usdiVal,
    iassetVal
  }
}

interface GetProps {
  userPubKey: PublicKey | null
  index: number
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface Balance {
  usdiVal: number
  iassetVal: number
}

export function useBalanceQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['borrowBalance', wallet, userPubKey, index], () => fetchBalance({ program: getCloneApp(wallet), userPubKey, index, setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['borrowBalance'], () => ({ usdiVal: 0, iassetVal: 0 }))
  }
}