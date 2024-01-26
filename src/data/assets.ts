import { PublicKey } from "@solana/web3.js"
import { ON_USD } from "~/utils/constants"
import { IS_DEV } from "./networks"

export enum Collateral {
    onUSD,
    mockUSDC,
}

export enum AssetTickers {
    arbitrum = 0,
    optimism = 1
}

export enum Asset {
    Arbitrum,
    Optimism
}

export enum AssetType {
    Crypto,
    Fx,
    Commodities,
}

export const DEFAULT_ASSET_ID = AssetTickers.arbitrum
export const DEFAULT_ASSET_LINK = "/comet/assets/arbitrum"

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
    }
]

// export const WRAP_ASSETS = [
//     {
//         tickerName: 'DeBridge Arbitrum',
//         tickerSymbol: 'dARB',
//         tickerIcon: '/images/assets/on-arb.svg',
//         ticker: 'arbitrum',
//         pythSymbol: 'Crypto.ARB/USD'
//     },
//     {
//         tickerName: 'Clone Optimism',
//         tickerSymbol: 'clOP',
//         tickerIcon: '/images/assets/on-op.svg',
//         ticker: 'optimism',
//         pythSymbol: 'Crypto.OP/USD'
//     }
// ]

export const assetMapping = (index: number) => {
    let tickerName = ''
    let tickerSymbol = ''
    let wrapTickerName = ''
    let wrapTickerSymbol = ''
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
            tickerIcon = '/images/assets/on-op.svg'
            ticker = 'optimism'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.OP/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("7QDfgP97Knwzz7uWrvzMEwFNLNT5Cbe2YPVKUY4WpBFa")
            break
        default:
            throw new Error('Not supported')
    }

    return { tickerName, tickerSymbol, wrapTickerName, wrapTickerSymbol, tickerIcon, ticker, assetType, pythSymbol, supabaseSymbol, underlyingTokenMint }
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
