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
		maxRange: 200.0,
		collAmount: 0.0,
		collRatio: 50,
		mintAmount: 0.0,
		lowerLimit: 40.1635123,
		centerPrice: 100.0,
		upperLimit: 180.8392343,
	}
}

export interface AssetData {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	price: number
	isTight: boolean
	tightRange: number
	maxRange: number
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
		tickerIcon: ethLogo,
		tickerSymbol: '',
		tickerName: '',
		price: 0.0,
		borrowFrom: 0.0,
		borrowFromBalance: 0,
		borrowTo: 0.0,
		borrowToBalance: 0,
	}
}

export interface UnconcentratedData {
	borrowFrom: number
	borrowFromBalance: number
	borrowTo: number
	borrowToBalance: number
}
