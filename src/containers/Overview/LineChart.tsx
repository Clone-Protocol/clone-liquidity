import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
// import dynamic from 'next/dynamic'
import { formatDollarAmount } from '~/utils/numbers'
import LineChartAlt from '~/components/Charts/LineChartAlt'
// import { unixToDate } from '~/utils/date'
import { StyledTabs, StyledTab } from '~/components/Charts/StyledTab'
import { TimeTabs, TimeTab, FilterTimeMap, FilterTime } from '~/components/Charts/TimeTabs'
import { useTotalLiquidityQuery, useTotalVolumeQuery } from '~/features/Chart/Liquidity.query'

const LineChart: React.FC = () => {
  // const LineChart = dynamic(() => import('~/components/Charts/LineChart'), { loading: () => <p>Loading ...</p>, ssr: false });
  // const SimpleBarChart = dynamic(() => import('~/components/Charts/SimpleBarChart'), { loading: () => <p>Loading ...</p>, ssr: false });

  const [tab, setTab] = useState(0)
  const [filterTime, setFilterTime] = useState<FilterTime>('7d')
  const [chartHover, setChartHover] = useState<number | undefined>()
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }
  const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterTime) => {
    setFilterTime(newValue)
  }

  const { data: totalLiquidity } = useTotalLiquidityQuery({
    timeframe: filterTime,
    refetchOnMount: false,
    enabled: tab === 0
  })
  const { data: totalVolume } = useTotalVolumeQuery({
    timeframe: filterTime,
    refetchOnMount: false,
    enabled: tab === 1
  })

  useEffect(() => {
    if (tab === 0) {
      setChartHover(totalLiquidity?.chartData[totalLiquidity?.chartData.length - 1].value)
    } else {
      setChartHover(totalVolume?.sumAllValue)
    }
  }, [totalLiquidity, totalVolume, tab])

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
    <LineChartAlt
      data={tab === 0 ? totalLiquidity?.chartData : totalVolume?.chartData}
      value={chartHover}
      setValue={setChartHover}
      maxY={tab === 0 ? totalLiquidity?.maxValue : totalVolume?.maxValue}
      minY={tab === 0 ? totalLiquidity?.minValue : totalVolume?.minValue}
      defaultValue={tab === 0 ? 0 : totalVolume?.sumAllValue}
      topLeft={
        <Box>
          <Box ml='20px'>
            <StyledTabs value={tab} onChange={handleChangeTab}>
              <StyledTab value={0} label="Total Liquidity"></StyledTab>
              <StyledTab value={1} label="Total Volume"></StyledTab>
            </StyledTabs>
          </Box>
          <SelectValue>{formatDollarAmount(chartHover, 0, true)}</SelectValue>
        </Box>
      }
      topRight={
        <div style={{ marginTop: '4px', marginRight: '15px' }}>
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

export default withSuspense(LineChart, <LoadingProgress />)