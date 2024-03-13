import { PublicKey } from "@solana/web3.js"
import { ON_USD } from "~/utils/constants"
import { IS_DEV } from "./networks"

export enum Collateral {
    onUSD,
    mockUSDC,
}

export enum AssetTickers {
    arbitrum = 0,
    optimism = 1,
    sui = 2,
    pepe = 3,
}

export enum Asset {
    Arbitrum,
    Optimism,
    Sui,
    Pepe
}

export enum AssetType {
    Crypto,
    Commodities,
}

export const DEFAULT_ASSET_ID = AssetTickers.arbitrum
export const DEFAULT_ASSET_LINK = "/comet/assets/arbitrum"

//@MEMO: to add more asset, need to adjust here
export const MAX_POOLS_FOR_SHOW = 3

export const ASSETS = [
    {
        tickerName: 'Clone Arbitrum',
        tickerSymbol: 'clARB',
        tickerIcon: '/images/assets/on-arb.svg',
        ticker: 'arbitrum',
        pythSymbol: 'Crypto.ARB/USD'
    },
    {
        tickerName: 'Clone Optimism',
        tickerSymbol: 'clOP',
        tickerIcon: '/images/assets/on-op.svg',
        ticker: 'optimism',
        pythSymbol: 'Crypto.OP/USD'
    },
    {
        tickerName: 'Clone Sui',
        tickerSymbol: 'clSUI',
        tickerIcon: '/images/assets/on-sui.svg',
        ticker: 'sui',
        pythSymbol: 'Crypto.SUI/USD'
    },
    {
        tickerName: 'Clone Pepe',
        tickerSymbol: 'clPepe',
        tickerIcon: '/images/assets/on-pepe.svg',
        ticker: 'pepe',
        pythSymbol: 'Crypto.PEPE/USD',
    }
]

export const assetMapping = (index: number) => {
    let tickerName = ''
    let tickerSymbol = ''
    let wrapTickerName = ''
    let wrapTickerSymbol = ''
    let wrapPortUrl = ''
    let tickerIcon = ''
    let ticker = ''
    let assetType: number
    let pythSymbol = ''
    let supabaseSymbol = ''
    let underlyingTokenMint = PublicKey.default
    switch (index) {
        case Asset.Arbitrum:
            tickerName = 'Clone Arbitrum'
            tickerSymbol = 'clARB'
            wrapTickerName = 'DeBridge Arbitrum'
            wrapTickerSymbol = 'deARB'
            wrapPortUrl = 'https://app.debridge.finance/deport?inputChain=42161&outputChain=7565164&inputCurrency=0x912ce59144191c1204e64559fe8253a0e49e6548&outputCurrency='
            tickerIcon = '/images/assets/on-arb.svg'
            ticker = 'arbitrum'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.ARB/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("9Bv59s4i393sqPysTEKA8xx47DQJ73EoBCS1DBbW9EWy")
            break
        case Asset.Optimism:
            tickerName = 'Clone Optimism'
            tickerSymbol = 'clOP'
            wrapTickerName = 'DeBridge Optimism'
            wrapTickerSymbol = 'deOP'
            wrapPortUrl = 'https://app.debridge.finance/deport?inputChain=10&outputChain=7565164&inputCurrency=0x4200000000000000000000000000000000000042&outputCurrency='
            tickerIcon = '/images/assets/on-op.svg'
            ticker = 'optimism'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.OP/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("7QDfgP97Knwzz7uWrvzMEwFNLNT5Cbe2YPVKUY4WpBFa")
            break
        case Asset.Sui:
            tickerName = 'Clone Sui'
            tickerSymbol = 'clSUI'
            wrapTickerName = 'Wormhole Sui'
            wrapTickerSymbol = 'wSUI'
            wrapPortUrl = 'https://portalbridge.com/'
            tickerIcon = '/images/assets/on-sui.svg'
            ticker = 'sui'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.SUI/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("G1vJEgzepqhnVu35BN4jrkv3wVwkujYWFFCxhbEZ1CZr")
            break
        case Asset.Pepe:
            tickerName = 'Clone Pepe'
            tickerSymbol = 'clPEPE'
            wrapTickerName = 'Wormhole Pepe'
            wrapTickerSymbol = 'wPEPE'
            wrapPortUrl = 'https://portalbridge.com/'
            tickerIcon = '/images/assets/on-pepe.svg'
            ticker = 'pepe'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.PEPE/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("G1vJEgzepqhnVu35BN4jrkv3wVwkujYWFFCxhbEZ1CZr")
            break
        default:
            throw new Error('Not supported')
    }

    return { tickerName, tickerSymbol, wrapTickerName, wrapTickerSymbol, wrapPortUrl, tickerIcon, ticker, assetType, pythSymbol, supabaseSymbol, underlyingTokenMint }
}

export const collateralMapping = (index: number) => {
    let collateralName = ''
    let collateralSymbol = ''
    let collateralIcon = ''
    let collateralType: number
    switch (index) {
        case Collateral.onUSD:
            collateralName = IS_DEV ? 'Clone USD' : 'USD Coin'
            collateralType = Collateral.onUSD
            collateralSymbol = ON_USD
            collateralIcon = IS_DEV ? '/images/assets/on-usd.svg' : '/images/assets/usdc.svg'
            break
        case Collateral.mockUSDC:
            collateralName = 'USD Coin'
            collateralType = Collateral.mockUSDC
            collateralSymbol = 'USDC'
            collateralIcon = '/images/assets/on-usd.svg'
            break
        default:
            throw new Error('Not supported')
    }

    return { collateralName, collateralSymbol, collateralIcon, collateralType }
}
