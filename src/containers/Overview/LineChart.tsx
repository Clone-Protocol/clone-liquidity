import React, { useMemo, useState } from 'react'
import { styled } from '@mui/system'
import { Box, Stack } from '@mui/material'
// import dynamic from 'next/dynamic'
import LineChartAlt from '~/components/Charts/LineChartAlt'
import { unixToDate } from '~/utils/date'
import { StyledTabs, StyledTab } from '~/components/Charts/StyledTab'
import { TimeTabs, TimeTab, FilterTimeMap, FilterTime } from '~/components/Charts/TimeTabs'

const LineChart: React.FC = () => {
  // const LineChart = dynamic(() => import('~/components/Charts/LineChart'), { loading: () => <p>Loading ...</p>, ssr: false });
  // const SimpleBarChart = dynamic(() => import('~/components/Charts/SimpleBarChart'), { loading: () => <p>Loading ...</p>, ssr: false });

  const [tab, setTab] = useState(0)
  const [filterTime, setFilterTime] = useState<FilterTime>('24h')
	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}
  const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterTime) => {
		setFilterTime(newValue)
	}

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
    <LineChartAlt
      data={chartData}
      topLeft={
        <Box>
          <Box>
            <StyledTabs value={tab} onChange={handleChangeTab}>
              <StyledTab value={0} label="Total Liquidity"></StyledTab>
              <StyledTab value={1} label="Total Users"></StyledTab>
            </StyledTabs>
          </Box>
          <SelectValue>$480.6m</SelectValue>
        </Box>
      }
      topRight={
        <TimeTabs value={filterTime} onChange={handleFilterChange}>
          {Object.keys(FilterTimeMap).map((f) => (
            <TimeTab key={f} value={f} label={FilterTimeMap[f as FilterTime]} />
          ))}
        </TimeTabs>
      }
    />
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

export default LineChart