import {
    TOKEN_PROGRAM_ID,
    getAccount,
    getAssociatedTokenAddress,
    TokenAccountNotFoundError,
  } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept";

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
          "processed",
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

export const getUSDiAccount = async (incept: InceptClient): Promise<PublicKey | undefined> => {
  const usdiTokenAccount = await getTokenAccount(
    incept.incept!.usdiMint,
    incept.provider.publicKey!,
    incept.connection
  );
  return usdiTokenAccount!;
}
