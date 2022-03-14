import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const fetchUnconcentDetail = async ({ program, userPubKey, index }: GetProps) => {
  if (!userPubKey) return 

	await program.loadManager()
	
  let borrowFrom = 0.0
  let borrowFromBalance = 0
  let borrowTo = 0.0
  let borrowToBalance = 0
	
	return {
		borrowFrom,
    borrowFromBalance,
    borrowTo,
    borrowToBalance
	}
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
  index: number
}

export interface UnconcentratedData {
  borrowFrom: number
  borrowFromBalance: number
  borrowTo: number
  borrowToBalance: number
}