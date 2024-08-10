import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { CloneClient, toCloneScale, toScale } from 'clone-protocol-sdk/sdk/src/clone'
import { useMutation } from '@tanstack/react-query'
import { useClone } from '~/hooks/useClone'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper'
import { useAtomValue } from 'jotai'
import { funcNoWallet } from '~/features/baseQuery'
import { FeeLevel } from '~/data/networks'
import { priorityFee } from '~/features/globalAtom'
import { AnchorProvider } from '@coral-xyz/anchor'

export const callClosingAccount = async ({
  program,
  userPubKey,
  setTxState,
  feeLevel,
}: CallTradingProps) => {
  if (!userPubKey) throw new Error('no user public key')
  console.log('closing account')
  //@todo
  const ixns: any = []

  await sendAndConfirm(program.provider as AnchorProvider, ixns, setTxState, feeLevel)

  return {
    result: true
  }
}

interface CallTradingProps {
  program: CloneClient
  userPubKey: PublicKey | null
  setTxState: (state: TransactionStateType) => void
  feeLevel: FeeLevel
}
export function useClosingAccountMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  const { setTxState } = useTransactionState()
  const feeLevel = useAtomValue(priorityFee)

  if (wallet) {
    return useMutation({ mutationFn: async () => callClosingAccount({ program: await getCloneApp(wallet), userPubKey, setTxState, feeLevel }) })
  } else {
    return useMutation({ mutationFn: () => funcNoWallet() })
  }
}