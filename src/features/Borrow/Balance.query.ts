import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getCollateralAccount } from '~/utils/token_accounts'
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

  const collateralTokenAccountAddress = await getTokenAccount(program.clone.collateral.mint, userPubKey, program.provider.connection);

  if (collateralTokenAccountAddress.isInitialized) {
    const onusdBalance = await program.provider.connection.getTokenAccountBalance(collateralTokenAccountAddress.address, "processed");
    onusdVal = Number(onusdBalance.value.amount) / 100000000;
  }

  const pools = await program.getPools()
  const pool = pools.pools[index];
  const onassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.onassetMint, userPubKey, program.provider.connection);
  if (onassetTokenAccountAddress.isInitialized) {
    const onassetBalance = await program.provider.connection.getTokenAccountBalance(onassetTokenAccountAddress.address, "processed");
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
    const devnetConversionFactor = Math.pow(10, -program.clone.collateral.scale)
    const collateralAssociatedTokenAccountInfo = await getCollateralAccount(program);
    if (collateralAssociatedTokenAccountInfo.isInitialized) {
      const balance = await program.provider.connection.getTokenAccountBalance(collateralAssociatedTokenAccountInfo.address, "processed");
      balanceVal = Number(balance.value.amount) * devnetConversionFactor;
    }
  } catch (e) {
    console.error(e)
  }

  return {
    balanceVal,
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