import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const callBorrow = async ({ program, userPubKey }: GetProps) => {
  if (!userPubKey) return null

	return
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
}
