import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { FilterType, FilterTypeMap, usePoolsQuery } from '~/features/MyLiquidity/Pools.query'
import GridComet from '~/components/Liquidity/GridComet'
import GridUnconcentrated from '~/components/Liquidity/GridUnconcentrated'
import GridBorrow from '~/components/Liquidity/GridBorrow'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
  const { data: assets } = usePoolsQuery({
    filter,
    refetchOnMount: 'always'
  })

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilter((event.target as HTMLInputElement).value as FilterType)
	}

  return (
    <Box sx={{ background: '#171717', color: '#fff' }}>
      <Tabs
        value={tab}
        onChange={handleChangeTab}
      >
        <Tab value={0} label="Comet" />
        <Tab value={1} label="Unconcentrated" />
        <Tab value={2} label="Borrow" />
      </Tabs>

      <Stack mb={2} direction="row" justifyContent="space-between">
        <RadioGroup row value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<FormControlLabel
							key={f}
							value={f}
							control={<Radio />}
							label={FilterTypeMap[f as FilterType]}
						/>
					))}
				</RadioGroup>
      </Stack>
      <TabPanel value={tab} index={0}>
        <GridComet assets={assets} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <GridUnconcentrated />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <GridBorrow />
      </TabPanel>
    </Box>
  )
}

export default LiquidityTable