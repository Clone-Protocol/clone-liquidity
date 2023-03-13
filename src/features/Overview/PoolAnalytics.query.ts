import { Query, useQuery } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping } from '~/data/assets'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { GoogleSpreadsheet } from "google-spreadsheet";

export const fetchPoolAnalytics = async ({ tickerSymbol, program, setStartTimer }: { tickerSymbol: string, program: InceptClient, setStartTimer: (start: boolean) => void }) => {
  console.log('fetchPoolAnalytics')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadManager();
  const tokenData = await program.getTokenData();

  const doc = new GoogleSpreadsheet(process.env.NEXT_GOOGLE_SHEETS_DOCUMENT_ID!);
  doc.useApiKey(process.env.NEXT_GOOGLE_SHEETS_GOOGLE_API_KEY!);

  await doc.loadInfo();
  const analyticsSheet = await doc.sheetsByTitle["Pool Analytics"]
  await analyticsSheet.loadCells();

  return (() => {
    for (let row = 1; row < 1 + tokenData.numPools.toNumber(); row++) {
        const poolIndex = analyticsSheet.getCell(row, 0).formattedValue
        if (poolIndex === null) {
          continue;
        }
        const tradingVol = analyticsSheet.getCell(row, 2).formattedValue
        const fees = analyticsSheet.getCell(row, 1).formattedValue
        const info = assetMapping(poolIndex)
        if (info.tickerSymbol === tickerSymbol) {
          const pool = tokenData.pools[Number(poolIndex)];
          const totalLiquidity = 2 * toNumber(pool.usdiAmount)
          return { totalLiquidity, tradingVol, fees }
        }
    }

    return {
      totalLiquidity: 15430459.49,
      tradingVol24h: 15430459.49,
      feeRevenue24h: 15430459.49,
    }
  })();
}

interface GetAssetsProps {
  tickerSymbol: string
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface AnalyticsInfo {
  totalLiquidity: number
  tradingVol24h: number
  feeRevenue24h: number
}

export function usePoolAnalyticsQuery({ tickerSymbol, refetchOnMount, enabled = true }: GetAssetsProps) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['poolAnalytics'], () => fetchPoolAnalytics({ tickerSymbol, program: getInceptApp(wallet), setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['poolAnalytics'], () => { })
  }
}
