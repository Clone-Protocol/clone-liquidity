import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { formatDollarAmount } from '~/utils/numbers'
import LineChartAlt from '~/components/Charts/LineChartAlt'
import { StyledTabs, StyledTab } from '~/components/Charts/StyledTab'
import { TimeTabs, TimeTab, FilterTimeMap, FilterTime } from '~/components/Charts/TimeTabs'
import { useTotalLiquidityQuery, useTotalVolumeQuery } from '~/features/Chart/Liquidity.query'

const MainChart: React.FC = () => {
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

  const { data: totalLiquidityDay } = useTotalLiquidityQuery({
    timeframe: '24h',
    refetchOnMount: false,
    enabled: tab === 0
  })
  const { data: totalVolumeDay } = useTotalVolumeQuery({
    timeframe: '24h',
    refetchOnMount: false,
    enabled: tab === 1
  })

  useEffect(() => {
    if (tab === 0) {
      setChartHover(totalLiquidityDay?.chartData[totalLiquidityDay?.chartData.length - 1].value)
    } else {
      setChartHover(totalVolumeDay?.sumAllValue)
    }
  }, [totalLiquidity, totalVolume, tab])

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
  font-size: 32px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #fff;
  margin-left: 20px;
  margin-top: 5px;
`

export default withSuspense(MainChart, <LoadingProgress />)
