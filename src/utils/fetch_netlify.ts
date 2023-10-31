import axios from "axios";

export const fetchFromCloneIndex = async (method: string, params: Object) => {
    let queryString = `method=${method}`
    for (let [key, val] of Object.entries(params)) {
        queryString += `&${key}=${val}`
    }
    return await axios.get(`/.netlify/functions/clone-index-fetch?${queryString}`)
}

export interface StatsData {
    time_interval: string;
    total_committed_collateral_liquidity: number;
    volume: number;
    trading_fees: number;
    pool_index: number | undefined;
}

export const fetchStatsData = async (interval: string, filter: string, aggregated: boolean = false): Promise<StatsData[]> => {

    let endpoint = (() => {
        if (aggregated) {
            return `/.netlify/functions/get-aggregated-stats?interval=${interval}&filter=${filter}`
        } else {
            return `/.netlify/functions/get-pool-stats?interval=${interval}&filter=${filter}`
        }
    })()

    const response = await axios.get(endpoint)
    return response.data as StatsData[]
}

export interface OHLCVResponse {
    time_interval: string,
    pool_index: number,
    open: string,
    high: string,
    low: string,
    close: string,
    volume: string,
    trading_fees: string
  }

export const fetchOHLCV = async (interval: string, filter: string, pool?: number | string): Promise<OHLCVResponse[]> => {
    let endpoint = `/.netlify/functions/get-ohlcv?interval=${interval}&filter=${filter}`

    if (pool !== undefined) 
        endpoint += `&pool=${pool}`

    const response = await axios.get(endpoint)
    return response.data as OHLCVResponse[]
}

export interface BorrowStats {
    pool_index: number,
    time_interval: string,
    cumulative_collateral_delta: number,
    cumulative_borrowed_delta: number
}

export const fetchBorrowStats = async (): Promise<BorrowStats[]> => {
    const response = await axios.get(`/.netlify/functions/get-borrow-stats`)
    return response.data as BorrowStats[]
}

export const fetchFromSupabaseNotice = async () => {
    return await axios.get(`/.netlify/functions/supabase-notice-fetch`)
}