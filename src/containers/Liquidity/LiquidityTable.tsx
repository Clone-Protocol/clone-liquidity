import { Box, Stack, Divider, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Comet from '~/containers/Liquidity/comet/Comet'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import { TabPanel, StyledTabs, CometTab, StyledTab } from '~/components/Common/StyledTab'
import { FilterType } from '~/data/filter'
import { useWallet } from '@solana/wallet-adapter-react'
import { useStatusQuery } from '~/features/MyLiquidity/Status.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import BorrowIconOff from 'public/images/borrow-position-icon-off.svg'
import BorrowIconOn from 'public/images/borrow-position-icon-on.svg'
import CometIconOff from 'public/images/multipool-icon-off.svg'
import CometIconOn from 'public/images/multipool-icon-on.svg'
import MyStatusValues from '~/components/Liquidity/MyStatusValues'
import MyStatus from '~/containers/Liquidity/MyStatus'

export const TAB_COMET = 0
export const TAB_BORROW = 1

const LiquidityTable = ({ ltab }: { ltab: string }) => {
  const [tab, setTab] = useState(TAB_COMET)
  const [filter, setFilter] = useState<FilterType>('all')

  // sub routing for tab
  useEffect(() => {
    if (ltab && parseInt(ltab.toString()) <= 1) {
      setTab(parseInt(ltab.toString()))
    }
  }, [ltab])

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  // const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
  //   setFilter(newValue)
  // }

  const { publicKey } = useWallet()
  const { data: status } = useStatusQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const hasNoPosition = !status ||
    (tab === TAB_BORROW && status.statusValues.totalBorrowLiquidity === 0)

  const newPositionUrl = tab === TAB_BORROW ? '/borrow' : `/assets/euro`

  return (
    <div>
      <Box>
        <MyStatus status={status} />
        <Divider sx={{ backgroundColor: '#3f3f3f' }} />

        <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '990px', marginTop: '12px', marginBottom: '12px' }}>
          <CometTab value={TAB_COMET} label='Comet' icon={tab === TAB_COMET ? <Image src={CometIconOn} alt='comet' /> : <Image src={CometIconOff} alt='comet' />} />\
          <StyledTab value={TAB_BORROW} label='Borrow' icon={tab === TAB_BORROW ? <Image src={BorrowIconOn} alt='borrow' /> : <Image src={BorrowIconOff} alt='borrow' />} />
        </StyledTabs>

        <Divider sx={{ background: '#3f3f3f', maxWidth: '680px' }} />

        {tab === TAB_BORROW &&
          <Stack direction='row' justifyContent='space-between' alignItems='flex-end' pt='22px'>
            <MyStatusValues tab={tab} status={status} />

            <Link href={newPositionUrl}><NewPositionButton sx={hasNoPosition ? { borderColor: '#258ded' } : {}}><Typography variant='p_sm'>+ New Position</Typography></NewPositionButton></Link>
          </Stack>
        }
      </Box>

      <PanelBox>
        {/* <Stack mt={3} mb={0} ml={3} pt={2} direction="row" justifyContent="space-between">
          <PageTabs value={filter} onChange={handleFilterChange}>
            {Object.keys(FilterTypeMap).map((f) => (
              <PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
            ))}
          </PageTabs>
        </Stack> */}

        {tab === TAB_BORROW &&
          <StyledDivider />
        }

        <TabPanel value={tab} index={TAB_COMET}>
          <Comet />
        </TabPanel>
        <TabPanel value={tab} index={TAB_BORROW}>
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
  width: 100px;
  height: 28px;
  color: #fff;
  padding: 8px 10px 8px 7px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  &:hover {
    background: ${(props) => props.theme.boxes.darkBlack};
  }
`

export default withSuspense(LiquidityTable, <LoadingProgress />)
