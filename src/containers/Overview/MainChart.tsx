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

  const { data: totalLiquidityDay } = useTotalLiquidityQuery({
    timeframe: filterTime,
    refetchOnMount: false,
    enabled: tab === 0
  })
  const { data: totalVolumeDay } = useTotalVolumeQuery({
    timeframe: filterTime,
    refetchOnMount: false,
    enabled: tab === 1
  })

  useEffect(() => {
    if (tab === 0) {
      setChartHover(totalLiquidityDay?.chartData[totalLiquidityDay?.chartData.length - 1].value)
    } else {
      setChartHover(totalVolumeDay?.sumAllValue)
    }
  }, [totalLiquidityDay, totalVolumeDay, tab])

  return (
    <LineChartAlt
      data={tab === 0 ? totalLiquidityDay?.chartData : totalVolumeDay?.chartData}
      value={chartHover}
      setValue={setChartHover}
      maxY={tab === 0 ? totalLiquidityDay?.maxValue : totalVolumeDay?.maxValue}
      minY={tab === 0 ? totalLiquidityDay?.minValue : totalVolumeDay?.minValue}
      defaultValue={tab === 0 ? 0 : totalVolumeDay?.sumAllValue}
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
