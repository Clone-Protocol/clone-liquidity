import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const fetchStatus = async ({ program, userPubKey }: GetProps) => {
  if (!userPubKey) return null

	return {
    totalVal: 100000,
    comet: 45000.00,
    cometPercent: 45,
    unconcentrated: 45000.00,
    unconcentratedPercent: 45,
    borrow: 10000.00,
    borrowPercent: 10
  }
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
}

export interface Status {
  totalVal: number
  comet: number
  cometPercent: number
  unconcentrated: number
  unconcentratedPercent: number
  borrow: number
  borrowPercent: number
}