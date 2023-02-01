import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
// import dynamic from 'next/dynamic'
import { useTotalLiquidityQuery, useTotalUsersQuery } from '~/features/Chart/Liquidity.query'
import LineChart from '~/components/Charts/LineChart'
// import { unixToDate } from '~/utils/date'

// interface Props {
//   tickerIcon: string;
//   tickerName: string;
//   tickerSymbol: string;
//   price: number;
// }

const PriceChart: React.FC = () => {
  const tickerIcon = '/images/assets/USDi.png'
  const tickerName = 'iSolana'
  const tickerSymbol = 'iSOL'
  const price = 110.51

  // TODO: need to change other query
  const { data: totalLiquidity } = useTotalLiquidityQuery({
    timeframe: '24h',
    refetchOnMount: false,
    enabled: true
  })

  return (
    <>
      <Box display="flex">
        <Box mr='10px'>
          <Image src={tickerIcon} width={30} height={30} />
        </Box>
        <Typography variant='p_xxlg'>{tickerName} ({tickerSymbol})</Typography>
      </Box>
      <Box display='flex' alignItems='center'>
        <Typography variant='p_xxxlg'>
          ${price.toLocaleString(undefined, { maximumFractionDigits: 3 })}
        </Typography>
        <Typography variant='p_sm' color='#989898' ml='10px'>
          iAsset Price
        </Typography>
      </Box>
      {/* 
        <TxtPriceRate>+${priceHistory.rateOfPrice.toFixed(3)} (+{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
       */}
      <LineChart
        data={totalLiquidity?.chartData}
      />
    </>
  )
}



export default PriceChart