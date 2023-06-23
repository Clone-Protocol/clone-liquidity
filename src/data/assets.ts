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
    cosmos = 5,
    avalanche = 6,
    sui = 7,
    aptos = 8,
    cardano = 9,
}

export enum Asset {
    Euro,
    Gold,
    Solana,
    Ethereum,
    Bitcoin,
    Cosmos,
    Avalanche,
    Sui,
    Aptos,
    Cardano,
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
        tickerSymbol: 'onGOLD',
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
        tickerName: 'Clone Cosmos',
        tickerSymbol: 'onATOM',
        tickerIcon: '/images/assets/on-atom.svg',
        ticker: 'cosmos',
        pythSymbol: 'Crypto.ATOM/USD'
    },
    {
        tickerName: 'Clone Avalanche',
        tickerSymbol: 'onAVAX',
        tickerIcon: '/images/assets/on-avax.svg',
        ticker: 'avalanche',
        pythSymbol: 'Crypto.AVAX/USD'
    },
    {
        tickerName: 'Clone Sui',
        tickerSymbol: 'onSUI',
        tickerIcon: '/images/assets/on-sui.svg',
        ticker: 'sui',
        pythSymbol: 'Crypto.SUI/USD'
    },
    {
        tickerName: 'Clone Aptos',
        tickerSymbol: 'onAPT',
        tickerIcon: '/images/assets/on-apt.svg',
        ticker: 'aptos',
        pythSymbol: 'Crypto.APT/USD'
    },
    {
        tickerName: 'Clone Cardano',
        tickerSymbol: 'onADA',
        tickerIcon: '/images/assets/on-ada.svg',
        ticker: 'cardano',
        pythSymbol: 'Crypto.ADA/USD'
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
            tickerSymbol = 'onGOLD'
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
        case Asset.Cosmos:
            tickerName = 'Clone Cosmos'
            tickerSymbol = 'onATOM'
            tickerIcon = '/images/assets/on-atom.svg'
            ticker = 'cosmos'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.ATOM/USD'
            break
        case Asset.Avalanche:
            tickerName = 'Clone Avalanche'
            tickerSymbol = 'onAVAX'
            tickerIcon = '/images/assets/on-avax.svg'
            ticker = 'avalanche'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.AVAX/USD'
            break
        case Asset.Sui:
            tickerName = 'Clone Sui'
            tickerSymbol = 'onSUI'
            tickerIcon = '/images/assets/on-sui.svg'
            ticker = 'sui'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.SUI/USD'
            break
        case Asset.Aptos:
            tickerName = 'Clone Aptos'
            tickerSymbol = 'onAPT'
            tickerIcon = '/images/assets/on-apt.svg'
            ticker = 'aptos'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.APT/USD'

            break
        case Asset.Cardano:
            tickerName = 'Clone Cardano'
            tickerSymbol = 'onADA'
            tickerIcon = '/images/assets/on-ada.svg'
            ticker = 'cardano'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.ADA/USD'
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
