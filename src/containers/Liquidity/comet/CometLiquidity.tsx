import { Box, Stack, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Comet from '~/containers/Liquidity/comet/Comet'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import { TabPanel, StyledTabs, CometTab } from '~/components/Common/StyledTab'
import { useWallet } from '@solana/wallet-adapter-react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'
import Collaterals from './Collaterals'
import Image from 'next/image'
import ArrowUpward from 'public/images/arrow-upward.svg'
import ArrowDownward from 'public/images/arrow-downward.svg'
import LiquidityPositions from './LiquidityPositions'

export const TAB_COLLATERAL = 0
export const TAB_POSITIONS = 1

const LiquidityTable = ({ ltab }: { ltab: string }) => {
  const [tab, setTab] = useState(TAB_COLLATERAL)
  const { publicKey } = useWallet()
  const { data: infos, refetch } = useCometInfoQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  // sub routing for tab
  useEffect(() => {
    if (ltab && parseInt(ltab.toString()) <= 1) {
      setTab(parseInt(ltab.toString()))
    }
  }, [ltab])

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <div>
      <Typography variant='h3' fontWeight={500}>Comet Liquidity</Typography>
      {infos && <Wrapper>
        <Stack direction='row' gap={16}>
          <Box>
            <Box display='flex' justifyContent='center'><Typography variant='p'>Comet Health Score</Typography></Box>
            <Box mt='15px'>
              {!infos.healthScore || Number.isNaN(infos.healthScore) ?
                <></> :
                <HealthscoreView score={infos.healthScore} />
              }
            </Box>
          </Box>
          <Box>
            <Box display='flex' justifyContent='center'><Typography variant='p'>Your Liquidity</Typography></Box>
            <StatusValue>
              <Typography variant='p_xlg'>
                {infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : ''}
              </Typography>
            </StatusValue>
          </Box>
          <Box>
            <Box display='flex' justifyContent='center'><Typography variant='p'>Your Colleteral</Typography></Box>
            <StatusValue>
              <Typography variant='p_xlg'>
                {infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : ''}
              </Typography>
            </StatusValue>
          </Box>
          <Box>
            <Box display='flex' justifyContent='center'><Typography variant='p'>Your PNL</Typography></Box>
            <StatusValue>
              <Box color='#4fe5ff'>
                <Typography variant='p_xlg'>+$14,452.34</Typography>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  <Typography variant='p'>+3.47%</Typography>
                  <Image src={ArrowUpward} alt='arrowUp' />
                </Box>
              </Box>
              {/* :
              <Box color='#ff0084'>
                <Typography variant='p_xlg'>-$14,452.34</Typography>
                <Box display='flex' alignItems='center'>
                  <Typography variant='p_xlg'>-3.47%</Typography>
                  <Image src={ArrowDownward} alt='arrowDown' />
                </Box>
              </Box> */}
            </StatusValue>
          </Box>
        </Stack>
      </Wrapper>}

      <Box>
        <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '590px', marginTop: '12px' }}>
          <CometTab value={TAB_COLLATERAL} label='Collateral' />\
          <CometTab value={TAB_POSITIONS} label='Positions' />
        </StyledTabs>
      </Box>

      <PanelBox>
        <TabPanel value={tab} index={TAB_COLLATERAL}>
          <Collaterals hasNoCollateral={infos ? infos.hasNoCollateral : false} collaterals={infos?.collaterals || []} onRefetchData={() => refetch()} />
        </TabPanel>
        <TabPanel value={tab} index={TAB_POSITIONS}>
          <LiquidityPositions hasNoCollateral={infos ? infos.hasNoCollateral : false} positions={infos?.positions || []} onRefetchData={() => refetch()} />
        </TabPanel>
      </PanelBox>
    </div>
  )
}

const Wrapper = styled(Box)`
  min-height: 160px;
  margin-top: 26px;
  margin-bottom: 25px;
  padding-top: 17px;
  padding-bottom: 17px;
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
const StatusValue = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
`
// const NewPositionButton = styled(Button)`
//   width: 100px;
//   height: 28px;
//   color: #fff;
//   padding: 8px 10px 8px 7px;
//   border: solid 1px ${(props) => props.theme.palette.text.secondary};
//   &:hover {
//     background: ${(props) => props.theme.boxes.darkBlack};
//   }
// `

export default withSuspense(LiquidityTable, <LoadingProgress />)
