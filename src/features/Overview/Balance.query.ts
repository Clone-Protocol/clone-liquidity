import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CLONE_TOKEN_SCALE, CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getCollateralAccount, getTokenAccount } from '~/utils/token_accounts'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchBalance = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
  if (!userPubKey) return null

  console.log('fetchBalance')

  let onusdVal = 0.0
  let onassetVal = 0.0

  const onusdTokenAccountAddress = await getTokenAccount(program.clone.collateral.mint, userPubKey, program.provider.connection);
  const devnetConversionFactor = Math.pow(10, -program.clone.collateral.scale)
  const cloneConversionFactor = Math.pow(10, -CLONE_TOKEN_SCALE)
  const collateralAssociatedTokenAccountInfo = await getCollateralAccount(program);
  if (onusdTokenAccountAddress.isInitialized) {
    const onusdBalance = await program.provider.connection.getTokenAccountBalance(collateralAssociatedTokenAccountInfo.address, "processed");
    onusdVal = Number(onusdBalance.value.amount) * devnetConversionFactor;
  }
  const pools = await program.getPools()
  const pool = pools.pools[index];
  const onassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.onassetMint, userPubKey, program.provider.connection);
  if (onassetTokenAccountAddress.isInitialized) {
    const onassetBalance = await program.provider.connection.getTokenAccountBalance(onassetTokenAccountAddress.address, "processed");
    onassetVal = Number(onassetBalance.value.amount) * cloneConversionFactor;
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
    return useQuery(['borrowBalance', wallet, userPubKey, index], async () => fetchBalance({ program: await getCloneApp(wallet), userPubKey, index }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['borrowBalance'], () => ({ onusdVal: 0, onassetVal: 0 }))
  }
}