export enum Collateral {
	onUSD,
	mockUSDC,
}

export enum AssetTickers {
	euro = 0,
	gold = 1,
	solana = 2,
	ethereum = 3,
	bitcoin = 4,
	bnb = 5,
	avalanche = 6,
	tesla = 7,
	apple = 8,
	amazon = 9,
}

export enum Asset {
	Euro,
	Gold,
	Solana,
	Ethereum,
	Bitcoin,
	BNB,
	Avalanche,
	Tesla,
	Apple,
	Amazon,
}

export enum AssetType {
	Crypto,
	Stocks,
	Fx,
	Commodities,
}

export const ASSETS = [
	{
		tickerName: 'Clone Euro',
		tickerSymbol: 'onEUR',
		tickerIcon: '/images/assets/on-euro.svg',
		ticker: 'euro',
		pythSymbol: 'FX.EUR/USD'
	},
	{
		tickerName: 'Clone Gold',
		tickerSymbol: 'onGold',
		tickerIcon: '/images/assets/on-gold.svg',
		ticker: 'gold',
		pythSymbol: 'Metal.XAU/USD'
	},
	{
		tickerName: 'Clone Solana',
		tickerSymbol: 'onSOL',
		tickerIcon: '/images/assets/on-sol.svg',
		ticker: 'solana',
		pythSymbol: 'Crypto.SOL/USD'
	},
	{
		tickerName: 'Clone Ethereum',
		tickerSymbol: 'onETH',
		tickerIcon: '/images/assets/on-eth.svg',
		ticker: 'ethereum',
		pythSymbol: 'Crypto.ETH/USD'
	},
	{
		tickerName: 'Clone Bitcoin',
		tickerSymbol: 'onBTC',
		tickerIcon: '/images/assets/on-btc.svg',
		ticker: 'bitcoin',
		pythSymbol: 'Crypto.BTC/USD'
	},
	{
		tickerName: 'Clone BNB',
		tickerSymbol: 'onBNB',
		tickerIcon: '/images/assets/on-bnb.svg',
		ticker: 'bnb',
		pythSymbol: 'Crypto.BNB/USD'
	},
	{
		tickerName: 'Clone Avalanche',
		tickerSymbol: 'onAVAX',
		tickerIcon: '/images/assets/on-avax.svg',
		ticker: 'avalanche',
		pythSymbol: 'Crypto.AVAX/USD'
	},
	{
		tickerName: 'Clone Tesla',
		tickerSymbol: 'onTLSA',
		tickerIcon: '/images/assets/on-tsla.svg',
		ticker: 'tesla',
		pythSymbol: 'Equity.US.TSLA/USD'
	},
	{
		tickerName: 'Clone Apple',
		tickerSymbol: 'onAAPL',
		tickerIcon: '/images/assets/on-aapl.svg',
		ticker: 'apple',
		pythSymbol: 'Equity.US.AAPL/USD'
	},
	{
		tickerName: 'Clone Amazon',
		tickerSymbol: 'onAMZN',
		tickerIcon: '/images/assets/on-amzn.svg',
		ticker: 'amazon',
		pythSymbol: 'Equity.US.AMZN/USD'
	},
]

export const assetMapping = (index: number) => {
	let tickerName = ''
	let tickerSymbol = ''
	let tickerIcon = ''
	let ticker = ''
	let assetType: number
	let pythSymbol = ''
	switch (index) {
		case Asset.Euro:
			tickerName = 'Clone Euro'
			tickerSymbol = 'onEUR'
			tickerIcon = '/images/assets/on-euro.svg'
			ticker = 'euro'
			assetType = AssetType.Fx
			pythSymbol = 'FX.EUR/USD'
			break
		case Asset.Gold:
			tickerName = 'Clone Gold'
			tickerSymbol = 'onGold'
			tickerIcon = '/images/assets/on-gold.svg'
			ticker = 'gold'
			assetType = AssetType.Commodities
			pythSymbol = 'Metal.XAU/USD'
			break
		case Asset.Solana:
			tickerName = 'Clone Solana'
			tickerSymbol = 'onSOL'
			tickerIcon = '/images/assets/on-sol.svg'
			ticker = 'solana'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.SOL/USD'
			break
		case Asset.Ethereum:
			tickerName = 'Clone Ethereum'
			tickerSymbol = 'onETH'
			tickerIcon = '/images/assets/on-eth.svg'
			ticker = 'ethereum'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.ETH/USD'
			break
		case Asset.Bitcoin:
			tickerName = 'Clone Bitcoin'
			tickerSymbol = 'onBTC'
			tickerIcon = '/images/assets/on-btc.svg'
			ticker = 'bitcoin'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.BTC/USD'
			break
		case Asset.BNB:
			tickerName = 'Clone BNB'
			tickerSymbol = 'onBNB'
			tickerIcon = '/images/assets/on-bnb.svg'
			ticker = 'bnb'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.BNB/USD'
			break
		case Asset.Avalanche:
			tickerName = 'Clone Avalanche'
			tickerSymbol = 'onAVAX'
			tickerIcon = '/images/assets/on-avax.svg'
			ticker = 'avalanche'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.AVAX/USD'
			break
		case Asset.Tesla:
			tickerName = 'Clone Tesla'
			tickerSymbol = 'onTLSA'
			tickerIcon = '/images/assets/on-tsla.svg'
			ticker = 'tesla'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.TSLA/USD'
			break
		case Asset.Apple:
			tickerName = 'Clone Apple'
			tickerSymbol = 'onAAPL'
			tickerIcon = '/images/assets/on-aapl.svg'
			ticker = 'apple'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.AAPL/USD'

			break
		case Asset.Amazon:
			tickerName = 'Clone Amazon'
			tickerSymbol = 'onAMZN'
			tickerIcon = '/images/assets/on-amzn.svg'
			ticker = 'amazon'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.AMZN/USD'
			break
		default:
			throw new Error('Not supported')
	}

	return { tickerName, tickerSymbol, tickerIcon, ticker, assetType, pythSymbol }
}

export const collateralMapping = (index: number) => {
	let collateralName = ''
	let collateralSymbol = ''
	let collateralIcon = ''
	let collateralType: number
	switch (index) {
		case Collateral.onUSD:
			collateralName = 'Clone USD'
			collateralType = Collateral.onUSD
			collateralSymbol = 'onUSD'
			collateralIcon = '/images/assets/on-usd.svg'
			break
		case Collateral.mockUSDC:
			collateralName = 'USDC'
			collateralType = Collateral.mockUSDC
			collateralSymbol = 'USDC'
			collateralIcon = '/images/assets/on-usd.svg'
			break
		default:
			throw new Error('Not supported')
	}

	return { collateralName, collateralSymbol, collateralIcon, collateralType }
}