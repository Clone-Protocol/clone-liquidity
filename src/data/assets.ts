export enum Collateral {
	USDi,
	mockUSDC,
}

export enum Asset {
	Euro,
	Gold,
	Solana,
	Ethereum,
	Bitcoin,
	Luna,
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
		pythSymbol: 'FX.EUR/USD'
	},
	{
		tickerName: 'iXAU (GOLD INDEX)',
		tickerSymbol: 'iXAU',
		tickerIcon: '/images/assets/gold.png',
		pythSymbol: 'Metal.XAU/USD'
	},
	{
		tickerName: 'iSolana',
		tickerSymbol: 'iSOL',
		tickerIcon: '/images/assets/solana.png',
		pythSymbol: 'Crypto.SOL/USD'
	},
	{
		tickerName: 'iEthereum',
		tickerSymbol: 'iETH',
		tickerIcon: '/images/assets/ethereum.png',
		pythSymbol: 'Crypto.ETH/USD'
	},
	{
		tickerName: 'iBitcoin',
		tickerSymbol: 'iBTC',
		tickerIcon: '/images/assets/bitcoin.png',
		pythSymbol: 'Crypto.BTC/USD'
	},
	{
		tickerName: 'iBNB',
		tickerSymbol: 'iBNB',
		tickerIcon: '/images/assets/bnb.png',
		pythSymbol: 'Crypto.BNB/USD'
	},
	{
		tickerName: 'iAvalanche',
		tickerSymbol: 'iAVAX',
		tickerIcon: '/images/assets/avalanche.png',
		pythSymbol: 'Crypto.AVAX/USD'
	},
	{
		tickerName: 'iTesla',
		tickerSymbol: 'iTLSA',
		tickerIcon: '/images/assets/tesla.png',
		pythSymbol: 'Equity.US.TSLA/USD'
	},
	{
		tickerName: 'iApple',
		tickerSymbol: 'iAAPL',
		tickerIcon: '/images/assets/apple.png',
		pythSymbol: 'Equity.US.AAPL/USD'
	},
	{
		tickerName: 'iAmazon',
		tickerSymbol: 'iAMZN',
		tickerIcon: '/images/assets/amazon.png',
		pythSymbol: 'Equity.US.AMZN/USD'
	},
]

export const assetMapping = (index: number) => {
	let tickerName = ''
	let tickerSymbol = ''
	let tickerIcon = ''
	let assetType: number
	let pythSymbol = ''
	switch (index) {
		case Asset.Euro:
			tickerName = 'iEuro'
			tickerSymbol = 'iEUR'
			tickerIcon = '/images/assets/euro.png'
			assetType = AssetType.Fx
			pythSymbol = 'FX.EUR/USD'
			break
		case Asset.Gold:
			tickerName = 'iXAU (GOLD INDEX)'
			tickerSymbol = 'iXAU'
			tickerIcon = '/images/assets/gold.png'
			assetType = AssetType.Commodities
			pythSymbol = 'Metal.XAU/USD'
			break
		case Asset.Solana:
			tickerName = 'iSolana'
			tickerSymbol = 'iSOL'
			tickerIcon = '/images/assets/solana.png'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.SOL/USD'
			break
		case Asset.Ethereum:
			tickerName = 'iEthereum'
			tickerSymbol = 'iETH'
			tickerIcon = '/images/assets/ethereum.png'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.ETH/USD'
			break
		case Asset.Bitcoin:
			tickerName = 'iBitcoin'
			tickerSymbol = 'iBTC'
			tickerIcon = '/images/assets/bitcoin.png'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.BTC/USD'
			break
		case Asset.Luna:
			tickerName = 'iBNB'
			tickerSymbol = 'iBNB'
			tickerIcon = '/images/assets/bnb.png'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.BNB/USD'
			break
		case Asset.Avalanche:
			tickerName = 'iAvalanche'
			tickerSymbol = 'iAVAX'
			tickerIcon = '/images/assets/avalanche.png'
			assetType = AssetType.Crypto
			pythSymbol = 'Crypto.AVAX/USD'
			break
		case Asset.Tesla:
			tickerName = 'iTesla'
			tickerSymbol = 'iTLSA'
			tickerIcon = '/images/assets/tesla.png'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.TSLA/USD'
			break
		case Asset.Apple:
			tickerName = 'iApple'
			tickerSymbol = 'iAAPL'
			tickerIcon = '/images/assets/apple.png'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.AAPL/USD'

			break
		case Asset.Amazon:
			tickerName = 'iAmazon'
			tickerSymbol = 'iAMZN'
			tickerIcon = '/images/assets/amazon.png'
			assetType = AssetType.Stocks
			pythSymbol = 'Equity.US.AMZN/USD'
			break
		default:
			throw new Error('Not supported')
	}

	return { tickerName, tickerSymbol, tickerIcon, assetType, pythSymbol }
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