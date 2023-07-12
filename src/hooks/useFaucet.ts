import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react'
import { getOnUSDAccount, getTokenAccount } from '~/utils/token_accounts'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { PROGRAM_ADDRESS as JUPITER_PROGRAM_ADDRESS, createMintUsdcInstruction, Jupiter } from 'clone-protocol-sdk/sdk/generated/jupiter-agg-mock/index'
import { DEVNET_TOKEN_SCALE } from 'clone-protocol-sdk/sdk/src/clone'
import { BN } from "@coral-xyz/anchor"
import { sendAndConfirm } from '~/utils/tx_helper'
import { useTransactionState } from './useTransactionState';
import { useClone } from './useClone';

export default function useFaucet() {
  const { connected, publicKey } = useWallet()
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  const [mintUsdi, setMintUsdi] = useState(false)
  const { setTxState } = useTransactionState()

  useEffect(() => {
    async function userMintOnusd() {
      const onusdToMint = 100;
      if (connected && publicKey && mintUsdi && wallet) {
        try {
          const program = getCloneApp(wallet)
          await program.loadClone()
          const usdiTokenAccount = await getOnUSDAccount(program);
          const onusdAta = await getAssociatedTokenAddress(program.clone!.onusdMint, publicKey);

          let [jupiterAddress, nonce] = PublicKey.findProgramAddressSync(
            [Buffer.from("jupiter")],
            new PublicKey(JUPITER_PROGRAM_ADDRESS)
          );
          let jupiterAccount = await Jupiter.fromAccountAddress(program.connection, jupiterAddress)
          const usdcTokenAccount = await getTokenAccount(jupiterAccount.usdcMint, publicKey, program.connection);
          const usdcAta = await getAssociatedTokenAddress(jupiterAccount.usdcMint, publicKey);

          let ixnCalls = []
          try {
            if (usdcTokenAccount === undefined) {
              ixnCalls.push((async () => createAssociatedTokenAccountInstruction(publicKey, usdcAta, publicKey, jupiterAccount.usdcMint))())
            }
            if (usdiTokenAccount === undefined) {
              ixnCalls.push((async () => createAssociatedTokenAccountInstruction(publicKey, onusdAta, publicKey, program.clone!.onusdMint))())
            }

            ixnCalls.push(
              createMintUsdcInstruction(
                {
                  usdcMint: jupiterAccount.usdcMint,
                  usdcTokenAccount: usdcAta,
                  jupiterAccount: jupiterAddress,
                  tokenProgram: TOKEN_PROGRAM_ID
                }, {
                nonce,
                amount: new BN(onusdToMint * Math.pow(10, 7))
              }
              )
            )

            ixnCalls.push(
              await program.mintOnusdInstruction(
                new BN(onusdToMint * Math.pow(10, DEVNET_TOKEN_SCALE)),
                onusdAta,
                usdcAta
              )
            )

            let ixns = await Promise.all(ixnCalls)
            await sendAndConfirm(program.provider, ixns, setTxState)
          } catch (e) {
            console.error(e)
          }
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
