import React from 'react'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
// import dynamic from 'next/dynamic'
import LineChart from '~/components/Charts/LineChart'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { usePriceHistoryQuery } from '~/features/Chart/PriceByAsset.query'
// import { unixToDate } from '~/utils/date'

interface Props {
  assetData: PositionInfo
  priceTitle: string
}

const PriceChart: React.FC<Props> = ({ assetData, priceTitle }) => {
  const { data: priceHistory } = usePriceHistoryQuery({
    pythSymbol: assetData?.pythSymbol,
    refetchOnMount: false,
    enabled: assetData != null
  })

  return (
    priceHistory ?
      <>
        <Box display="flex">
          <Box mr='10px'>
            <Image src={assetData.tickerIcon} width={30} height={30} />
          </Box>
          <Typography variant='p_xxlg'>{assetData.tickerName} ({assetData.tickerSymbol})</Typography>
        </Box>
        <Box display='flex' alignItems='center'>
          <Typography variant='p_xxxlg'>
            ${priceHistory.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 3 })}
          </Typography>
          <Typography variant='p_sm' color='#989898' ml='10px'>
            {priceTitle}
          </Typography>
        </Box>
        <Typography variant='p' color='#4fe5ff'>{priceHistory.rateOfPrice >= 0 ? '+' : '-'}${Math.abs(priceHistory.rateOfPrice).toFixed(3)} ({priceHistory.percentOfRate.toFixed(2)}%) past 24h</Typography>
        <LineChart
          data={priceHistory?.chartData}
        />
      </>
      : <></>
  )
}



export default PriceChart