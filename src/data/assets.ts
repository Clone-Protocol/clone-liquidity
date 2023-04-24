export enum Collateral {
	USDi,
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
		tickerName: 'iEuro',
		tickerSymbol: 'iEUR',
		tickerIcon: '/images/assets/euro.png',
		ticker: 'euro',
		pythSymbol: 'FX.EUR/USD'
	},
	{
		tickerName: 'iXAU (GOLD INDEX)',
		tickerSymbol: 'iXAU',
		tickerIcon: '/images/assets/gold.png',
		ticker: 'gold',
		pythSymbol: 'Metal.XAU/USD'
	},
	{
		tickerName: 'iSolana',
		tickerSymbol: 'iSOL',
		tickerIcon: '/images/assets/solana.png',
		ticker: 'solana',
		pythSymbol: 'Crypto.SOL/USD'
	},
	{
		tickerName: 'iEther',
		tickerSymbol: 'iETH',
		tickerIcon: '/images/assets/ethereum.png',
		ticker: 'ethereum',
		pythSymbol: 'Crypto.ETH/USD'
	},
	{
		tickerName: 'iBitcoin',
		tickerSymbol: 'iBTC',
		tickerIcon: '/images/assets/bitcoin.png',
		ticker: 'bitcoin',
		pythSymbol: 'Crypto.BTC/USD'
	},
	{
		tickerName: 'iBNB',
		tickerSymbol: 'iBNB',
		tickerIcon: '/images/assets/bnb.png',
		ticker: 'bnb',
		pythSymbol: 'Crypto.BNB/USD'
	},
	{
		tickerName: 'iAvalanche',
		tickerSymbol: 'iAVAX',
		tickerIcon: '/images/assets/avalanche.png',
		ticker: 'avalanche',
		pythSymbol: 'Crypto.AVAX/USD'
	},
	{
		tickerName: 'iTesla',
		tickerSymbol: 'iTLSA',
		tickerIcon: '/images/assets/tesla.png',
		ticker: 'tesla',
		pythSymbol: 'Equity.US.TSLA/USD'
	},
	{
		tickerName: 'iApple',
		tickerSymbol: 'iAAPL',
		tickerIcon: '/images/assets/apple.png',
		ticker: 'apple',
		pythSymbol: 'Equity.US.AAPL/USD'
	},
	{
		tickerName: 'iAmazon',
		tickerSymbol: 'iAMZN',
		tickerIcon: '/images/assets/amazon.png',
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
			tickerName = 'iEuro'
			tickerSymbol = 'iEUR'
			tickerIcon = '/images/assets/euro.png'
			ticker = 'euro'
			assetType = AssetType.Fx
			pythSymbol = 'FX.EUR/USD'
			break
		case Asset.Gold:
			tickerName = 'iXAU (GOLD INDEX)'
			tickerSymbol = 'iXAU'
			tickerIcon = '/images/assets/gold.png'
			ticker = 'gold'
			assetType = AssetType.Commodities
			pythSymbol = 'Metal.XAU/USD'
			break
		case Asset.Solana:
			tickerName = 'iSolana'
			tickerSymbol = 'iSOL'
			tickerIcon = '/images/assets/solana.png'
			ticker = 'solana'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.SOL/USD'
			break
		case Asset.Ethereum:
			tickerName = 'iEther'
			tickerSymbol = 'iETH'
			tickerIcon = '/images/assets/ethereum.png'
			ticker = 'ethereum'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.ETH/USD'
			break
		case Asset.Bitcoin:
			tickerName = 'iBitcoin'
			tickerSymbol = 'iBTC'
			tickerIcon = '/images/assets/bitcoin.png'
			ticker = 'bitcoin'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.BTC/USD'
			break
		case Asset.BNB:
			tickerName = 'iBNB'
			tickerSymbol = 'iBNB'
			tickerIcon = '/images/assets/bnb.png'
			ticker = 'bnb'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.BNB/USD'
			break
		case Asset.Avalanche:
			tickerName = 'iAvalanche'
			tickerSymbol = 'iAVAX'
			tickerIcon = '/images/assets/avalanche.png'
			ticker = 'avalanche'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.AVAX/USD'
			break
		case Asset.Tesla:
			tickerName = 'iTesla'
			tickerSymbol = 'iTLSA'
			tickerIcon = '/images/assets/tesla.png'
			ticker = 'tesla'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.TSLA/USD'
			break
		case Asset.Apple:
			tickerName = 'iApple'
			tickerSymbol = 'iAAPL'
			tickerIcon = '/images/assets/apple.png'
			ticker = 'apple'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.AAPL/USD'

			break
		case Asset.Amazon:
			tickerName = 'iAmazon'
			tickerSymbol = 'iAMZN'
			tickerIcon = '/images/assets/amazon.png'
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
	let collateralType: number
	switch (index) {
		case Collateral.USDi:
			collateralName = 'USDi'
			collateralType = Collateral.USDi
			break
		case Collateral.mockUSDC:
			collateralName = 'USDC'
			collateralType = Collateral.mockUSDC
			break
		default:
			throw new Error('Not supported')
	}

	return { collateralName, collateralType }
}