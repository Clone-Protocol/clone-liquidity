import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const fetchBalance = async ({ program, userPubKey }: GetProps) => {
  if (!userPubKey) return null

  await program.loadManager();

  let balanceVal = 0.0;

  try {
    balanceVal = await program.getUsdiBalance();
  } catch {}

	return {
    balanceVal: balanceVal
  }
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
}

export interface Balance {
  balanceVal: number
}