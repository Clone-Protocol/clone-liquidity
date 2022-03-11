import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"
import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

export const fetchBorrowDetail = async ({ program, userPubKey }: GetProps) => {
  if (!userPubKey) return null

	return {
    tickerIcon: ethLogo,
    tickerName: 'Solana',
    tickerSymbol: 'SOL',
    price: 110.78,
    collateral: 80450.85,
    collateralRatio: 121.74,
    borrowedAmount: 1.00,
  }
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
}

export interface PositionInfo {
  tickerIcon: string,
  tickerName: string | null,
  tickerSymbol: string | null,
  price: number,
  collateral: number,
  collateralRatio: number,
  borrowedAmount: number,
}