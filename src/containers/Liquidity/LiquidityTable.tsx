import { Box, Stack, Divider } from '@mui/material'
import { styled } from '@mui/system'
import { useEffect, useState } from 'react'
import GridComet from '~/containers/Liquidity/comet/GridComet'
import GridUnconcentrated from '~/containers/Liquidity/unconcentrated/GridUnconcentrated'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import { TabPanel, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { FilterType, FilterTypeMap } from '~/data/filter'
import Image from 'next/image'
import CometIconOff from 'public/images/comet-icon-off.svg'
import UlIconOff from 'public/images/ul-icon-off.svg'
import BorrowIconOff from 'public/images/borrow-position-icon-off.svg'
import CometIconOn from 'public/images/comet-icon-on.svg'
import UlIconOn from 'public/images/ul-icon-on.svg'
import BorrowIconOn from 'public/images/borrow-position-icon-on.svg'

const LiquidityTable = () => {
	const [tab, setTab] = useState(0)
	const [filter, setFilter] = useState<FilterType>('all')

	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

	return (
    <div>
      <StyledTabs value={tab} onChange={handleChangeTab}>
        <StyledTab value={0} label="Comet Liquidity" icon={tab === 0 ? <Image src={CometIconOn} /> : <Image src={CometIconOff} />} />
        <StyledTab value={1} label="Unconcentrated Liquidity" icon={tab === 1 ? <Image src={UlIconOn} /> : <Image src={UlIconOff} />} />
        <StyledTab value={2} label="Borrow Position" icon={tab === 2 ? <Image src={BorrowIconOn} /> : <Image src={BorrowIconOff} />} />
      </StyledTabs>
      
      <Box
        sx={{
          background: 'rgba(21, 22, 24, 0.75)',
          color: '#fff',
          '& .super-app-theme--header': { color: '#9d9d9d', fontSize: '13px' },
          // '& .super-app-theme--row': { border: 'solid 1px #535353' },
          // '& .super-app-theme--cell': { borderBottom: 'solid 1px #535353' },
        }}>
        <Stack mt={3} mb={0} ml={3} pt={2} direction="row" justifyContent="space-between">
          <PageTabs value={filter} onChange={handleFilterChange}>
            {Object.keys(FilterTypeMap).map((f) => (
              <PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
            ))}
          </PageTabs>
        </Stack>
        <StyledDivider />
        <TabPanel value={tab} index={0}>
          <GridComet filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <GridUnconcentrated filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <GridBorrow filter={filter} />
        </TabPanel>
      </Box>
    </div>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
  margin: 0 auto;
	margin-top: 20px;
  width: 95%;
	height: 1px;
`

export default LiquidityTable
