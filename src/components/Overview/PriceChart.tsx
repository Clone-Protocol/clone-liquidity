import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
// import dynamic from 'next/dynamic'
import { useTotalLiquidityQuery, useTotalUsersQuery } from '~/features/Chart/Liquidity.query'
import LineChart from '~/components/Charts/LineChart'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
// import { unixToDate } from '~/utils/date'

interface Props {
  assetData: PositionInfo
}

const PriceChart: React.FC<Props> = ({ assetData }) => {
  // TODO: need to change other query
  const { data: totalLiquidity } = useTotalLiquidityQuery({
    timeframe: '24h',
    refetchOnMount: false,
    enabled: true
  })

  // const { data: priceHistory } = usePriceHistoryQuery({
  //   tickerSymbol: borrowAsset?.tickerSymbol,
  //   refetchOnMount: false,
  //   enabled: borrowAsset != null
  // })

  return (
    <>
      <Box display="flex">
        <Box mr='10px'>
          <Image src={assetData.tickerIcon} width={30} height={30} />
        </Box>
        <Typography variant='p_xxlg'>{assetData.tickerName} ({assetData.tickerSymbol})</Typography>
      </Box>
      <Box display='flex' alignItems='center'>
        <Typography variant='p_xxxlg'>
          ${assetData.price.toLocaleString(undefined, { maximumFractionDigits: 3 })}
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