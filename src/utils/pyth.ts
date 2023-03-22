import axios from 'axios';

type Network = "devnet" | "mainnet";
type Range = "1H" | "1D" | "1W" | "1M"

export interface PythData {
    timestamp: string;
    open_price: number;
    low_price: number;
    high_price: number;
    close_price: number;
    avg_price: number;
    avg_confidence: number;
    avg_emaPrice: number;
    start_slot: number;
    end_slot: number;
}

export const fetchPythPriceHistory = async (pythSymbol: string, network: Network, range: Range): Promise<PythData[]> => {

    const url = `https://web-api.pyth.network/history?symbol=${pythSymbol}&range=${range}&cluster=${network}`
    const result = await axios.get(
        url
    );
    return result.data;
}