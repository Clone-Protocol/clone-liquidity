import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { FilterType, FilterTypeMap, useCometPoolsQuery } from '~/features/MyLiquidity/CometPools.query'
import { useUnconcentPoolsQuery } from '~/features/MyLiquidity/UnconcentratedPools.query'
import { useBorrowQuery } from '~/features/MyLiquidity/Borrow.query'
import GridComet from '~/components/Liquidity/GridComet'
import GridUnconcentrated from '~/components/Liquidity/GridUnconcentrated'
import GridBorrow from '~/components/Liquidity/GridBorrow'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

interface StyledTabProps {
  label: string;
  value: number;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: '500',
  fontSize: '18px',
  marginRight: theme.spacing(1),
  color: '#989898',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: '#3d3d3d',
  },
}));

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

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilter((event.target as HTMLInputElement).value as FilterType)
	}

  return (
    <Box sx={{ background: '#171717', color: '#fff' }}>
      <StyledTabs
        value={tab}
        onChange={handleChangeTab}
      >
        <StyledTab value={0} label="Comet" />
        <StyledTab value={1} label="Unconcentrated" />
        <StyledTab value={2} label="Borrow" />
      </StyledTabs>

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