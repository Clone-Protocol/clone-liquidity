import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { FilterType, FilterTypeMap, useCometPoolsQuery } from '~/features/MyLiquidity/CometPools.query'
import { useUnconcentPoolsQuery } from '~/features/MyLiquidity/UnconcentratedPools.query'
import { useBorrowQuery } from '~/features/MyLiquidity/Borrow.query'
import GridComet from '~/components/Liquidity/GridComet'
import GridUnconcentrated from '~/components/Liquidity/GridUnconcentrated'
import GridBorrow from '~/components/Liquidity/GridBorrow'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import { TabPanelProps, StyledTabs, StyledTab } from '~/components/Common/StyledTab'

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

const LiquidityTable = () => {
  const [tab, setTab] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const { data: cometPools } = useCometPoolsQuery({
    filter
  })
  const { data: unconcentPools } = useUnconcentPoolsQuery({
    filter
  })
  const { data: borrowAssets } = useBorrowQuery({
    filter
  })

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

  return (
    <Box sx={{ background: '#171717', color: '#fff', '& .super-app-theme--header': {color: '#9d9d9d', fontSize: '13px'}, '& .super-app-theme--row': { border: 'solid 1px #535353'}, '& .super-app-theme--cell': { borderBottom: 'solid 1px #535353'} }}>
      <StyledTabs
        value={tab}
        onChange={handleChangeTab}
      >
        <StyledTab value={0} label="Comet" />
        <StyledTab value={1} label="Unconcentrated" />
        <StyledTab value={2} label="Borrow" />
      </StyledTabs>

      <Stack mt={4} mb={2} direction="row" justifyContent="space-between">
        <PageTabs value={filter} onChange={handleFilterChange}>
          {Object.keys(FilterTypeMap).map((f) => (
            <PageTab 
            	key={f}
							value={f}
              label={FilterTypeMap[f as FilterType]}
            />
					))}
        </PageTabs>
      </Stack>
      <TabPanel value={tab} index={0}>
        <GridComet pools={cometPools} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <GridUnconcentrated pools={unconcentPools} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <GridBorrow assets={borrowAssets} />
      </TabPanel>
    </Box>
  )
}

export default LiquidityTable