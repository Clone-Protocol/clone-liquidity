import axios from 'axios';
import { ASSETS, assetMapping } from '~/data/assets';

export type Network = "devnet" | "mainnet-beta" | "pythnet" | "testnet" | "pythtest";
export type Range = "1H" | "1D" | "1W" | "1M" | "1Y"

export interface PythData {
    timestamp: string;
    price: number;
}

export const convertPythSymbolToSupabaseSymbol = (pythSymbol: string): string => {

    for (let i = 0; i < ASSETS.length; i++) {
        const mapping = assetMapping(i)
        if (pythSymbol === mapping.pythSymbol)
            return mapping.supabaseSymbol
    }
    throw new Error(`Couldn't find pyth symbol: ${pythSymbol}`)
}

export const fetchPythPriceHistory = async (pythSymbol: string, range: Range): Promise<PythData[]> => {

    const symbol = convertPythSymbolToSupabaseSymbol(pythSymbol)
    const currentTimestamp = Math.floor((new Date()).getTime() / 1000)
    const [from, filterDaily] = (() => {
        switch (range) {
            case "1H":
                return [currentTimestamp - 3600, false]
            case "1D":
                return [currentTimestamp - 86400, false]
            case "1W":
                return [currentTimestamp - 7 * 86400, false]
            case "1M":
                return [currentTimestamp - 30 * 86400, true]
            case "1Y":
                return [currentTimestamp - 365 * 86400, true]
            default:
                throw new Error("Unknown range", range)
        }
    })()

    let queryString = `symbol=${symbol}&from=${from}`
    if (filterDaily)
        queryString = queryString.concat('&dailyClose=true')

    let response = await axios.get(`/.netlify/functions/pyth-data-fetch?${queryString}`)

    return response.data
}