import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
// import dynamic from 'next/dynamic'
import { useTotalLiquidityQuery, useTotalUsersQuery } from '~/features/Chart/Liquidity.query'
import LineChart from '~/components/Charts/LineChart'
// import { unixToDate } from '~/utils/date'

const PriceChart: React.FC = () => {

  // const formattedData = useMemo(() => {
  //   if (chartData) {
  //     return chartData.map((day: ChartElem) => {
  //       return {
  //         time: unixToDate(day.date),
  //         value: day.liquidity,
  //       }
  //     })
  //   } else {
  //     return []
  //   }
  // }, [chartData])

  // TODO: need to change other query
  const { data: totalLiquidity } = useTotalLiquidityQuery({
    timeframe: '24h',
    refetchOnMount: false,
    enabled: true
  })

  return (
    <>
      <LineChart
        data={totalLiquidity?.chartData}
      />
    </>
  )
}

const SelectValue = styled(Box)`
  font-size: 24px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #fff;
  margin-left: 20px;
  margin-top: 17px;
`

export default PriceChart