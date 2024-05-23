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
    doge = 3,
    bnb = 4,
    apt = 5,
}

export enum Asset {
    Arbitrum,
    Optimism,
    Sui,
    Doge,
    Bnb,
    Apt,
}

export enum AssetType {
    Crypto,
    Commodities,
}

export const DEFAULT_ASSET_ID = AssetTickers.arbitrum
export const DEFAULT_ASSET_LINK = "/comet/assets/arbitrum"

//@MEMO: to add more asset, need to adjust here
export const MAX_POOLS_FOR_SHOW = 6

export const ASSETS = [
    {
        tickerName: 'Cloned Arbitrum',
        tickerSymbol: 'clARB',
        tickerIcon: '/images/assets/on-arb.svg',
        ticker: 'arbitrum',
        pythSymbol: 'Crypto.ARB/USD'
    },
    {
        tickerName: 'Cloned Optimism',
        tickerSymbol: 'clOP',
        tickerIcon: '/images/assets/on-op.svg',
        ticker: 'optimism',
        pythSymbol: 'Crypto.OP/USD'
    },
    {
        tickerName: 'Cloned Sui',
        tickerSymbol: 'clSUI',
        tickerIcon: '/images/assets/on-sui.svg',
        ticker: 'sui',
        pythSymbol: 'Crypto.SUI/USD'
    },
    {
        tickerName: 'Cloned Doge',
        tickerSymbol: 'clDOGE',
        tickerIcon: '/images/assets/on-doge.svg',
        ticker: 'doge',
        pythSymbol: 'Crypto.DOGE/USD',
    },
    {
        tickerName: 'Cloned BNB',
        tickerSymbol: 'clBNB',
        tickerIcon: '/images/assets/on-bnb.svg',
        ticker: 'bnb',
        pythSymbol: 'Crypto.BNB/USD',
    },
    {
        tickerName: 'Cloned APT',
        tickerSymbol: 'clAPT',
        tickerIcon: '/images/assets/on-apt.svg',
        ticker: 'apt',
        pythSymbol: 'Crypto.APT/USD',
    },
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
            tickerName = 'Cloned Arbitrum'
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
            tickerName = 'Cloned Optimism'
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
            tickerName = 'Cloned Sui'
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
        case Asset.Doge:
            tickerName = 'Cloned Doge'
            tickerSymbol = 'clDOGE'
            wrapTickerName = 'DeBridge Doge'
            wrapTickerSymbol = 'deDOGE'
            wrapPortUrl = 'https://app.debridge.finance/deport?inputChain=56&outputChain=7565164&inputCurrency=0xba2ae424d960c26247dd6c32edc70b295c744c43&outputCurrency='
            tickerIcon = '/images/assets/on-doge.svg'
            ticker = 'doge'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.DOGE/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("H7ijetaTKRQbN3GSpxiW46sSpT8Rw3xHfdiDQN9Lx9LX")
            break
        case Asset.Bnb:
            tickerName = 'Cloned BNB'
            tickerSymbol = 'clBNB'
            wrapTickerName = 'DeBridge BNB'
            wrapTickerSymbol = 'deBNB'
            wrapPortUrl = 'https://app.debridge.finance/deport?inputChain=56&outputChain=7565164&inputCurrency=&outputCurrency='
            tickerIcon = '/images/assets/on-bnb.svg'
            ticker = 'bnb'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.BNB/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("HYi7mwm4mGMjxEB94coLeTqVYMw6YmUk4Y8irUMFdoTc")
            break
        case Asset.Apt:
            tickerName = 'Cloned APT'
            tickerSymbol = 'clAPT'
            wrapTickerName = 'Wormhole APT'
            wrapTickerSymbol = 'wAPT'
            wrapPortUrl = 'https://portalbridge.com/'
            tickerIcon = '/images/assets/on-apt.svg'
            ticker = 'apt'
            assetType = AssetType.Crypto
            pythSymbol = 'Crypto.APT/USD'
            supabaseSymbol = pythSymbol
            underlyingTokenMint = new PublicKey("6LNeTYMqtNm1pBFN8PfhQaoLyegAH8GD32WmHU9erXKN")
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
