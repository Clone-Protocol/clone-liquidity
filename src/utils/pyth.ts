import axios from 'axios';
import { ASSETS, assetMapping } from '~/data/assets';
import { PythHttpClient, getPythProgramKeyForCluster, PythCluster } from "@pythnetwork/client"
import { Connection, PublicKey } from "@solana/web3.js"
import { fromScale } from 'clone-protocol-sdk/sdk/src/clone';
import { Oracles, OracleSource } from 'clone-protocol-sdk/sdk/generated/clone'
import { IS_DEV } from '~/data/networks';

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
    let queryString = `symbol=${symbol}&range=${range}`
    const config = {
        headers: {
            'Cache-Control': 'max-age=60',
            'Netlify-Vary': 'query=symbol'
        }
    }
    let response = await axios.get(`/.netlify/functions/pyth-data-fetch?${queryString}`, config)

    return response.data
}

// Fetches the latest oracle prices from Pyth ordered by the order of the oracles in the program,
// If the price isn't found in the pyth data, or the source is not pyth, it will return the last
// saved oracle price from the onchain account.
export const fetchPythOraclePrices = async (connection: Connection, oracles: Oracles): Promise<number[]> => {
    const cluster = IS_DEV ? "devnet" : "mainnet-beta";
    const pythClient = new PythHttpClient(connection, new PublicKey(getPythProgramKeyForCluster(cluster)));
    const pythData = await pythClient.getData();

    const pythOraclePrices = oracles.oracles.map((oracle) => {
        if (oracle.source === OracleSource.PYTH) {
            const feedAddress = oracle.address.toString()
            const product = pythData.products.find((p) => p.price_account === feedAddress)!
            return pythData.productPrice.get(product.symbol)?.aggregate.price ?? fromScale(oracle.price, oracle.expo)
        }
        return fromScale(oracle.price, oracle.expo)
    })
    return pythOraclePrices;
}