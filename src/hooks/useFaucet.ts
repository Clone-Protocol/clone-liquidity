import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { toScale } from 'clone-protocol-sdk/sdk/src/clone'
import { sendAndConfirm } from '~/utils/tx_helper'
import { useTransactionState } from './useTransactionState';
import { useClone } from './useClone';
import { createMintAssetInstruction } from 'clone-protocol-sdk/sdk/generated/mock-asset-faucet'
import { getCollateralAccount } from '~/utils/token_accounts';

export default function useFaucet() {
  const { connected, publicKey } = useWallet()
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()
  const [mintUsdi, setMintUsdi] = useState(false)
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

          const usdcTokenAccount = await getCollateralAccount(program)

          let ixnCalls = []
          try {
            ixnCalls.push(
              await createMintAssetInstruction({
                minter: publicKey,
                faucet: faucetAddress,
                mint: program.clone.collateral.mint,
                tokenAccount: usdcTokenAccount.address,
              }, { amount: toScale(onusdToMint, program.clone.collateral.scale) })
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
