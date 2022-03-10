import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"
import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

export const fetchCometDetail = async ({ program, userPubKey }: GetProps) => {
  if (!userPubKey) return null

	return {
    tickerIcon: ethLogo,
    tickerName: 'Solana',
    tickerSymbol: 'SOL',
    price: 110.78,
    collateral: 80450.85,
    contributedUSD: 100000.00,
    contributedAsset: 1000.00,
    lowerLimitPriceRange: 50.43,
    upperLimitPriceRange: 150.89,
    centerPriceRange: 110.28,
    ild: 450.87
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
  contributedUSD: number,
  contributedAsset: number,
  lowerLimitPriceRange: number,
  upperLimitPriceRange: number,
  centerPriceRange: number,
  ild: number
}