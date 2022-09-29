import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAccount,
    getAssociatedTokenAddress,
    TokenAccountNotFoundError,
    createAssociatedTokenAccountInstruction
  } from "@solana/spl-token";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Incept } from "incept-protocol-sdk/sdk/src/incept";

export const getTokenAccount = async (mint: PublicKey, owner: PublicKey, connection: Connection): Promise<PublicKey | undefined> => {
    const associatedToken = await getAssociatedTokenAddress(
        mint,
        owner
    );

    let account;

    try {
        account = await getAccount(
          connection,
          associatedToken,
          "recent",
          TOKEN_PROGRAM_ID
        );
      } catch (error: unknown) {
        if (error instanceof TokenAccountNotFoundError) {
            return undefined;
        } else {
            throw error;
        }
      }

    return account.address;
}

export const getUSDiAccount = async (incept: Incept): Promise<PublicKey | undefined> => {
  const usdiTokenAccount = await getTokenAccount(
    incept.manager!.usdiMint,
    incept.provider.wallet.publicKey,
    incept.connection
  );
  return usdiTokenAccount!;
}

export const createTokenAccountInstruction = async (mint: PublicKey, incept: Incept): Promise<TransactionInstruction> => {
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    incept.provider.publicKey!,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return createAssociatedTokenAccountInstruction(
    incept.provider.publicKey!,
    associatedToken,
    incept.provider.publicKey!,
    mint,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
}