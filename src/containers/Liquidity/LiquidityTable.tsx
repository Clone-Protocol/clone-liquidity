//@deprecated
import { Box, Stack, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Comet from '~/containers/Liquidity/comet/Comet'
import BorrowPositions from '~/containers/Liquidity/borrow/BorrowPositions'
import { TabPanel, StyledTabs, CommonTab, StyledTab } from '~/components/Common/StyledTab'
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

  const { publicKey } = useWallet()
  const { data: status } = useStatusQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const hasNoPosition = !status ||
    (tab === TAB_BORROW && status.statusValues.totalBorrowLiquidity === 0)

  const newPositionUrl = tab === TAB_BORROW ? '/borrow' : `/comet/assets/euro`

  return (
    <div>
      <Box>
        <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '990px', marginTop: '12px', marginBottom: '12px' }}>
          <CommonTab value={TAB_COMET} label='Comet' icon={tab === TAB_COMET ? <Image src={CometIconOn} alt='comet' /> : <Image src={CometIconOff} alt='comet' />} />\
          <StyledTab value={TAB_BORROW} label='Borrow' icon={tab === TAB_BORROW ? <Image src={BorrowIconOn} alt='borrow' /> : <Image src={BorrowIconOff} alt='borrow' />} />
        </StyledTabs>

        {tab === TAB_BORROW &&
          <Stack direction='row' justifyContent='space-between' alignItems='flex-end' pt='22px'>
            <MyStatusValues tab={tab} status={status} />

            <Link href={newPositionUrl}><NewPositionButton sx={hasNoPosition ? { borderColor: '#258ded' } : {}}><Typography variant='p_sm'>+ New Position</Typography></NewPositionButton></Link>
          </Stack>
        }
      </Box>

      <PanelBox>
        <TabPanel value={tab} index={TAB_COMET}>
          <Comet />
        </TabPanel>
        <TabPanel value={tab} index={TAB_BORROW}>
          <BorrowPositions filter={filter} />
        </TabPanel>
      </PanelBox>
    </div>
  )
}

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
