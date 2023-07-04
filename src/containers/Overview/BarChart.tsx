//@Deprecated
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import BarChartAlt from '~/components/Charts/BarChartAlt'
import { formatDollarAmount } from '~/utils/numbers'
// import { unixToDate } from '~/utils/date'
import { StyledTabs, StyledTab } from '~/components/Charts/StyledTab'
import { TimeTabs, TimeTab, FilterTimeMap, FilterTime } from '~/components/Charts/TimeTabs'
import { useTotalVolumeQuery, useTotalLiquidationQuery } from '~/features/Chart/Liquidity.query'

const BarChart: React.FC = () => {
  // const LineChart = dynamic(() => import('~/components/Charts/LineChart'), { loading: () => <p>Loading ...</p>, ssr: false });
  // const SimpleBarChart = dynamic(() => import('~/components/Charts/SimpleBarChart'), { loading: () => <p>Loading ...</p>, ssr: false });

  const [tab, setTab] = useState(0)
  const [filterTime, setFilterTime] = useState<FilterTime>('24h')
  const [chartHover, setChartHover] = useState<number | undefined>()
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }
  const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterTime) => {
    setFilterTime(newValue)
  }

  const { data: totalVolume } = useTotalVolumeQuery({
    timeframe: filterTime,
    refetchOnMount: false,
    enabled: tab === 0
  })
  const { data: totalLiquidation } = useTotalLiquidationQuery({
    timeframe: filterTime,
    refetchOnMount: false,
    enabled: tab === 1
  })

  useEffect(() => {
    if (chartHover === undefined && totalVolume) {
      if (tab === 0) {
        setChartHover(totalVolume?.chartData[totalVolume?.chartData.length - 1].value)
      } else {
        setChartHover(totalLiquidation?.chartData[totalLiquidation?.chartData.length - 1].value)
      }
    }
  }, [chartHover, totalVolume, totalLiquidation, tab])

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

  return (
    <BarChartAlt
      data={tab === 0 ? totalVolume?.chartData : totalLiquidation?.chartData}
      value={chartHover}
      setValue={setChartHover}
      topLeft={
        <Box>
          <Box>
            <StyledTabs value={tab} onChange={handleChangeTab}>
              <StyledTab value={0} label="Total Volume"></StyledTab>
              <StyledTab value={1} label="Total Liquidation"></StyledTab>
            </StyledTabs>
          </Box>
          <SelectValue>{formatDollarAmount(chartHover, 0, true)}</SelectValue>
        </Box>
      }
      topRight={
        <div style={{ marginTop: '4px' }}>
          <TimeTabs value={filterTime} onChange={handleFilterChange}>
            {Object.keys(FilterTimeMap).map((f) => (
              <TimeTab key={f} value={f} label={FilterTimeMap[f as FilterTime]} />
            ))}
          </TimeTabs>
        </div>
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

export default withSuspense(BarChart, <LoadingProgress />)