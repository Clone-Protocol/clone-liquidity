import { getNetworkDetailsFromEnv } from 'clone-protocol-sdk/sdk/src/network'
import { Clone as CloneAccount } from 'clone-protocol-sdk/sdk/generated/clone'
import { PublicKey, Connection, Commitment } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { AnchorWallet } from '@solana/wallet-adapter-react';

export const funcNoWallet = async () => {
  console.log('no wallet')
  return {
    result: false
  }
}

export const getCloneClient = async (wallet?: AnchorWallet) => {
  const network = getNetworkDetailsFromEnv()
  const connection = new Connection(network.endpoint)

  let provider
  if (wallet) {
    const opts = {
      preflightCommitment: "processed" as Commitment,
    }
    provider = new AnchorProvider(connection, wallet, opts)
  } else {
    // MEMO: to support provider without wallet adapter
    provider = new AnchorProvider(
      connection,
      {
        signTransaction: () => Promise.reject(),
        signAllTransactions: () => Promise.reject(),
        publicKey: PublicKey.default, // MEMO: dummy pubkey
      },
      {}
    );
  }

  const [cloneAccountAddress, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("clone")],
    network.clone
  );
  const cloneAccount = await CloneAccount.fromAccountAddress(
    provider.connection,
    cloneAccountAddress
  );

  const program = new CloneClient(provider, cloneAccount, network.clone)
  return {
    cloneClient: program,
    connection,
  }
}