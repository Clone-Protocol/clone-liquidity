import axios from "axios";
import { FeeLevel } from "~/data/networks";

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

export const fetchPoolApy = async (): Promise<{ pool_index: number, apy_24hr?: number }[]> => {
    const response = await axios.get(`/.netlify/functions/get-pool-apy`)
    return response.data as { pool_index: number, apy_24hr?: number }[]
}

export type UserApy = {
    apy: number
    avgCollateral: number
    poolApy: number[]
}

export const fetchUserApy = async (user_address: string, poolIndexes: number[]): Promise<UserApy> => {
    const response = await axios.get(`/.netlify/functions/get-user-apy?user_address=${user_address}&pool_indexes=${poolIndexes.join(',')}`)
    return response.data as UserApy
}

export const fetchTotalLiquidity = async (interval: string, filter: string): Promise<{ time_interval: string, total_liquidity: number }[]> => {
    const response = await axios.get(`/.netlify/functions/get-total-liquidity?interval=${interval}&filter=${filter}`)
    return response.data as { time_interval: string, total_liquidity: number }[]
}

export const fetchFromSupabaseNotice = async () => {
    return await axios.get(`/.netlify/functions/supabase-notice-fetch`)
}

export type UserPointsView = {
    rank: number
    user_address: string
    trading_points: number
    lp_points: number
    social_points: number
    total_points: number
    name?: string
}

export const fetchUserPoints = async (userAddress?: string): Promise<UserPointsView[]> => {
    let url = `/.netlify/functions/get-user-points`;
    if (userAddress) {
        url += `?userAddress=${userAddress}`;
    }
    const response = await axios.get(url)
    return response.data as UserPointsView[]
}

export const fetchGeoBlock = async (): Promise<{ result: boolean, whitelistAddr?: string[] }> => {
    const response = await axios.post(`/api/route`)
    return response.data
}

export type PriorityFeeEstimate = Record<FeeLevel, number>
export type PriorityFeeEstimateResponse = {
    priorityFeeLevels: PriorityFeeEstimate
}

export const getHeliusPriorityFeeEstimate = async () => {
    const response = await axios.get(`/.netlify/functions/get-priority-fee-estimate`)
    return response.data.priorityFeeLevels as PriorityFeeEstimate
}

export const fetchTotalCumulativeVolume = async (interval: string): Promise<{ time_interval: string, cumulative_volume: number }[]> => {
    const response = await axios.get(`/.netlify/functions/get-cumulative-volume?interval=${interval}`)
    return response.data as { time_interval: string, cumulative_volume: number }[]
}