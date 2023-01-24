import { Box, Stack, Divider, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import GridComet from '~/containers/Liquidity/comet/GridComet'
import GridUnconcentrated from '~/containers/Liquidity/unconcentrated/GridUnconcentrated'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import MultipoolComet from '~/containers/Liquidity/multipool/MultipoolComet'
import { TabPanel, StyledTabs, MultipoolTab, StyledTab } from '~/components/Common/StyledTab'
import { FilterType } from '~/data/filter'
import Image from 'next/image'
import CometIconOff from 'public/images/comet-icon-off.svg'
import UlIconOff from 'public/images/ul-icon-off.svg'
import BorrowIconOff from 'public/images/borrow-position-icon-off.svg'
import CometIconOn from 'public/images/comet-icon-on.svg'
import UlIconOn from 'public/images/ul-icon-on.svg'
import BorrowIconOn from 'public/images/borrow-position-icon-on.svg'
import MultipoolIconOff from 'public/images/multipool-icon-off.svg'
import MultipoolIconOn from 'public/images/multipool-icon-on.svg'
import MyStatusValues from '~/components/Liquidity/MyStatusValues'

const LiquidityTable: React.FC = () => {
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

  // const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
  //   setFilter(newValue)
  // }

  return (
    <div>
      <Box>
        <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '990px', marginTop: '12px', marginBottom: '12px' }}>
          <MultipoolTab value={0} label='Multipool Comet' icon={tab === 0 ? <Image src={MultipoolIconOn} /> : <Image src={MultipoolIconOff} />} />
          <StyledTab value={1} label='Singlepool Comet' icon={tab === 1 ? <Image src={CometIconOn} /> : <Image src={CometIconOff} />} />
          <StyledTab value={2} label='Unconcentrated' icon={tab === 2 ? <Image src={UlIconOn} /> : <Image src={UlIconOff} />} />
          <StyledTab value={3} label='Borrow' icon={tab === 3 ? <Image src={BorrowIconOn} /> : <Image src={BorrowIconOff} />} />
        </StyledTabs>

        <Divider sx={{ background: '#3f3f3f', maxWidth: '680px' }} />

        <Stack direction='row' justifyContent='space-between' alignItems='center' paddingTop='22px'>
          <MyStatusValues tab={tab} />

          <NewPositionButton><Typography variant='p_sm'>+ New Position</Typography></NewPositionButton>
        </Stack>
      </Box>

      <PanelBox>
        {/* <Stack mt={3} mb={0} ml={3} pt={2} direction="row" justifyContent="space-between">
          <PageTabs value={filter} onChange={handleFilterChange}>
            {Object.keys(FilterTypeMap).map((f) => (
              <PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
            ))}
          </PageTabs>
        </Stack> */}
        <StyledDivider />

        <TabPanel value={tab} index={0}>
          <MultipoolComet />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <GridComet filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <GridUnconcentrated filter={filter} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <GridBorrow filter={filter} />
        </TabPanel>
      </PanelBox>
    </div>
  )
}

const StyledDivider = styled(Divider)`
	background-color: #3f3f3f;
  margin: 0 auto;
	margin-top: 20px;
  width: 100%;
	height: 1px;
`
const PanelBox = styled(Box)`
  min-height: 250px;
  margin-bottom: 25px;
  color: #fff;
  & .super-app-theme--header { 
    color: #9d9d9d; 
    font-size: 13px; 
  }
`
const NewPositionButton = styled(Button)`
  width: 90px;
  height: 28px;
  color: #fff;
  padding: 8px 10px 8px 7px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
`

export default LiquidityTable
