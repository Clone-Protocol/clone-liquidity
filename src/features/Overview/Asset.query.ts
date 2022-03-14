import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

/* Comet Liquidity */
export const fetchAsset = () => {
	return {
    tickerIcon: ethLogo,
    tickerName: 'Solana',
    tickerSymbol: 'SOL',
    price: 110.78,
    isTight: false,
    tightRange: 30,
    collAmount: 0.0,
    collRatio: 50,
    mintAmount: 0.0,
    lowerLimit: 20.0,
    centerPrice: 100.00,
    upperLimit: 180.0
  }
}

export interface AssetData {
  tickerIcon: string
	tickerName: string
	tickerSymbol: string
  price: number
  isTight: boolean
  tightRange: number
  collAmount: number
  collRatio: number
  mintAmount: number
  lowerLimit: number
  centerPrice: number
  upperLimit: number 
}

/* Unconcentrated Liquidity */
export const fetchUnconcentrated = () => {
  return {
    borrowFrom: 0.0,
    borrowFromBalance: 0,
    borrowTo: 0.0,
    borrowToBalance: 0
  }
}

export interface UnconcentratedData {
  borrowFrom: number
  borrowFromBalance: number
  borrowTo: number
  borrowToBalance: number
}