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

export const getCloneClient = async (networkEndpoint: string, wallet?: AnchorWallet) => {
  const connection = new Connection(networkEndpoint, {
    commitment: 'confirmed'
  })

  let provider
  if (wallet) {
    const opts = {
      preflightCommitment: "confirmed" as Commitment,
    }
    //Mocking specific pub key
    // wallet.publicKey = new PublicKey("5uXVGF8JPf6Hhcyu7GWSSLXGsJF8vz6XBBJg6A3ytoMH")
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

  const programId = new PublicKey(process.env.NEXT_PUBLIC_CLONE_PROGRAM_ID!);
  const [cloneAccountAddress, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("clone")],
    programId
  );
  const cloneAccount = await CloneAccount.fromAccountAddress(
    provider.connection,
    cloneAccountAddress
  );

  const program = new CloneClient(provider, cloneAccount, programId)
  return {
    cloneClient: program,
    connection,
  }
}