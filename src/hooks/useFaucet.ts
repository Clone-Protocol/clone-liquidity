import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { toScale } from 'clone-protocol-sdk/sdk/src/clone'
import { sendAndConfirm } from '~/utils/tx_helper'
import { useTransactionState } from './useTransactionState';
import { useClone } from './useClone';
import { createMintAssetInstruction } from 'clone-protocol-sdk/sdk/generated/mock-asset-faucet'
import { getTokenAccount } from '~/utils/token_accounts';
import { useAtom, useAtomValue } from 'jotai';
import { mintUSDi, priorityFee } from '~/features/globalAtom';

export default function useFaucet() {
  const { connected, publicKey } = useWallet()
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  const [mintUsdi, setMintUsdi] = useAtom(mintUSDi)
  const feeLevel = useAtomValue(priorityFee)
  const { setTxState } = useTransactionState()
  const MOCK_FAUCET_PROGRAM_ID = process.env.NEXT_PUBLIC_MOCK_FAUCET_PROGRAM_ID!

  useEffect(() => {
    async function userMintOnusd() {
      const onusdToMint = 100;
      if (connected && publicKey && mintUsdi && wallet) {
        try {
          const program = await getCloneApp(wallet)

          const [faucetAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("faucet")],
            new PublicKey(MOCK_FAUCET_PROGRAM_ID)
          );

          const usdcAssociatedTokenAccount = await getTokenAccount(
            program.clone.collateral.mint,
            program.provider.publicKey!,
            program.provider.connection,
          );

          let ixns: TransactionInstruction[] = []

          if (!usdcAssociatedTokenAccount.isInitialized) {
            ixns.push(
              createAssociatedTokenAccountInstruction(
                program.provider.publicKey!,
                usdcAssociatedTokenAccount.address,
                program.provider.publicKey!,
                program.clone.collateral.mint
              )
            )
          }
          ixns.push(
            createMintAssetInstruction({
              minter: publicKey,
              faucet: faucetAddress,
              mint: program.clone.collateral.mint,
              tokenAccount: usdcAssociatedTokenAccount.address,
            }, { amount: toScale(onusdToMint, program.clone.collateral.scale) })
          )

          await sendAndConfirm(program.provider, ixns, setTxState, feeLevel)
        } finally {
          setMintUsdi(false)
        }
      }
    }
    userMintOnusd()
  }, [mintUsdi, connected, publicKey])

  return {
    setMintUsdi
  }
}
