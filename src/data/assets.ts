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
	},
	{
		tickerName: 'iSPTSGD (GOLD INDEX)',
		tickerSymbol: 'iSPTSGD',
		tickerIcon: '/images/assets/gold.png',
	},
	{
		tickerName: 'iSolana',
		tickerSymbol: 'iSOL',
		tickerIcon: '/images/assets/solana.png',
	},
	{
		tickerName: 'iEthereum',
		tickerSymbol: 'iETH',
		tickerIcon: '/images/assets/ethereum.png',
	},
	{
		tickerName: 'iBitcoin',
		tickerSymbol: 'iBTC',
		tickerIcon: '/images/assets/bitcoin.png',
	},
	{
		tickerName: 'iLuna',
		tickerSymbol: 'iLUNA',
		tickerIcon: '/images/assets/terra.png',
	},
	{
		tickerName: 'iAvalanche',
		tickerSymbol: 'iAVAX',
		tickerIcon: '/images/assets/avalanche.png',
	},
	{
		tickerName: 'iTesla',
		tickerSymbol: 'iTLSA',
		tickerIcon: '/images/assets/tesla.png',
	},
	{
		tickerName: 'iApple',
		tickerSymbol: 'iAAPL',
		tickerIcon: '/images/assets/apple.png',
	},
	{
		tickerName: 'iAmazon',
		tickerSymbol: 'iAMZN',
		tickerIcon: '/images/assets/amazon.png',
	},
]

export const assetMapping = (index: number) => {
	let tickerName = ''
	let tickerSymbol = ''
	let tickerIcon = ''
	let assetType: number
	switch (index) {
		case Asset.Euro:
			tickerName = 'iEuro'
			tickerSymbol = 'iEUR'
			tickerIcon = '/images/assets/euro.png'
			assetType = AssetType.Fx
			break
		case Asset.Gold:
			tickerName = 'iSPTSGD (GOLD INDEX)'
			tickerSymbol = 'iSPTSGD'
			tickerIcon = '/images/assets/gold.png'
			assetType = AssetType.Commodities
			break
		case Asset.Solana:
			tickerName = 'iSolana'
			tickerSymbol = 'iSOL'
			tickerIcon = '/images/assets/solana.png'
			assetType = AssetType.Crypto
			break
		case Asset.Ethereum:
			tickerName = 'iEthereum'
			tickerSymbol = 'iETH'
			tickerIcon = '/images/assets/ethereum.png'
			assetType = AssetType.Crypto
			break
		case Asset.Bitcoin:
			tickerName = 'iBitcoin'
			tickerSymbol = 'iBTC'
			tickerIcon = '/images/assets/bitcoin.png'
			assetType = AssetType.Crypto
			break
		case Asset.Luna:
			tickerName = 'iLuna'
			tickerSymbol = 'iLUNA'
			tickerIcon = '/images/assets/terra.png'
			assetType = AssetType.Crypto
			break
		case Asset.Avalanche:
			tickerName = 'iAvalanche'
			tickerSymbol = 'iAVAX'
			tickerIcon = '/images/assets/avalanche.png'
			assetType = AssetType.Crypto
			break
		case Asset.Tesla:
			tickerName = 'iTesla'
			tickerSymbol = 'iTLSA'
			tickerIcon = '/images/assets/tesla.png'
			assetType = AssetType.Stocks
			break
		case Asset.Apple:
			tickerName = 'iApple'
			tickerSymbol = 'iAAPL'
			tickerIcon = '/images/assets/apple.png'
			assetType = AssetType.Stocks
			break
		case Asset.Amazon:
			tickerName = 'iAmazon'
			tickerSymbol = 'iAMZN'
			tickerIcon = '/images/assets/amazon.png'
			assetType = AssetType.Stocks
			break
		default:
			throw new Error('Not supported')
	}

	return { tickerName, tickerSymbol, tickerIcon, assetType }
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