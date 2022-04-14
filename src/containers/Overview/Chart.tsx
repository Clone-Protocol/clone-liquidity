import React, { useMemo } from 'react'
import { styled } from '@mui/system'
import { Box, Stack } from '@mui/material'
// import dynamic from 'next/dynamic'
import LineChartAlt from '~/components/Charts/LineChartAlt'
import SimpleBarChart from '~/components/Charts/SimpleBarChart'
import { unixToDate } from '~/utils/date'

const Chart: React.FC = () => {
  // const LineChart = dynamic(() => import('~/components/Charts/LineChart'), { loading: () => <p>Loading ...</p>, ssr: false });
  // const SimpleBarChart = dynamic(() => import('~/components/Charts/SimpleBarChart'), { loading: () => <p>Loading ...</p>, ssr: false });

  const chartData = [
    {
      time: '2022-03-01',
      value: 15
    },
    {
      time: '2022-03-02',
      value: 35
    },
    {
      time: '2022-03-03',
      value: 80
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 115
    },
  ]

  const formattedData = useMemo(() => {
    if (chartData) {
      return chartData.map((day: any) => {
        return {
          time: unixToDate(day.date),
          value: day.liquidity,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  return (
    <Box display="flex">
      <LineChartAlt
        data={chartData}
        topLeft={
          <SelectValue>$480.6m</SelectValue>
        }
      />
      {/* <LineChart /> */}
      <SimpleBarChart />
    </Box>
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

export default Chart