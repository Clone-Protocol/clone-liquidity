import { Box, Stack, Divider } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import GridComet from '~/containers/Liquidity/comet/GridComet'
import GridUnconcentrated from '~/containers/Liquidity/unconcentrated/GridUnconcentrated'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import MultipoolComet from '~/containers/Liquidity/multipool/MultipoolComet'
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
import MultipoolIconOff from 'public/images/multipool-icon-off.svg'
import MultipoolIconOn from 'public/images/multipool-icon-on.svg'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

const LiquidityTable = () => {
  const router = useRouter()
  const { ltab } = router.query
	const [tab, setTab] = useState(0)
	const [filter, setFilter] = useState<FilterType>('all')

  // sub routing for tab
  useEffect(() => {
    if (ltab && parseInt(ltab.toString()) <= 3) {
      setTab(parseInt(ltab.toString()))
    }
  }, [ltab])

	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue) 
	}

	const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

  const cometLiquidityTabLabel = <React.Fragment>Comet Liquidity <InfoTooltip title={TooltipTexts.cometLiquidityTab} /> </React.Fragment>
  const unconcentratedLiquidityTabLabel = <React.Fragment>Unconcentrated Liquidity <InfoTooltip title={TooltipTexts.unconcentratedLiquidityTab} /> </React.Fragment>
  const borrowPositionTabLabel = <React.Fragment>Borrow Position <InfoTooltip title={TooltipTexts.borrowPositionTab} /> </React.Fragment> 
  const multipoolCometTabLabel = <React.Fragment>Multipool Comet Liquidity <InfoTooltip title={TooltipTexts.multipoolCometTab} /> </React.Fragment>   

	return (
    <div>
      <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '990px' }}>
        <StyledTab value={0} label={cometLiquidityTabLabel} icon={tab === 0 ? <Image src={CometIconOn} /> : <Image src={CometIconOff} />} />
        <StyledTab value={1} label={unconcentratedLiquidityTabLabel} icon={tab === 1 ? <Image src={UlIconOn} /> : <Image src={UlIconOff} />} />
        <StyledTab value={2} label={borrowPositionTabLabel} icon={tab === 2 ? <Image src={BorrowIconOn} /> : <Image src={BorrowIconOff} />} />
        <StyledTab value={3} label={multipoolCometTabLabel} icon={tab === 3 ? <Image src={MultipoolIconOn} /> : <Image src={MultipoolIconOff} />} sx={{ background: 'rgba(24, 24, 40, 0.75)' }} />
      </StyledTabs>
      
      <Box
        sx={{
          background: 'rgba(21, 22, 24, 0.75)',
          borderRadius: '10px',
          minHeight: '250px',
          marginBottom: '25px',
          color: '#fff',
          '& .super-app-theme--header': { color: '#9d9d9d', fontSize: '13px' },
        }}>
        { tab <= 2 &&
          (
            <>
              <Stack mt={3} mb={0} ml={3} pt={2} direction="row" justifyContent="space-between">
                <PageTabs value={filter} onChange={handleFilterChange}>
                  {Object.keys(FilterTypeMap).map((f) => (
                    <PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
                  ))}
                </PageTabs>
              </Stack>
              <StyledDivider />
            </>
          )
        }
        <TabPanel value={tab} index={0}>
          <GridComet filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <GridUnconcentrated filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <GridBorrow filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <MultipoolComet />
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
