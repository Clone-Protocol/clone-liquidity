import { Box, Stack, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Comet from '~/containers/Liquidity/comet/Comet'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import { TabPanel, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { useWallet } from '@solana/wallet-adapter-react'
import { useStatusQuery } from '~/features/MyLiquidity/Status.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'

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
      {infos && <Wrapper>
        <Stack direction='row'>
          <Box marginRight='31px'>
            <Box><Typography variant='p' color='#989898'>Health Score</Typography></Box>
            <Box mt='15px'>
              {!infos.healthScore || Number.isNaN(infos.healthScore) ?
                <></> :
                <HealthscoreView score={infos.healthScore} />
              }
            </Box>
          </Box>
          <Box display='flex'>
            <Box marginLeft='31px' marginRight='31px'>
              <Box><Typography variant='p' color='#989898'>Colleteral Value</Typography></Box>
              <Box mt='15px'>
                <Typography variant='p_xlg'>
                  {infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : ''}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box display='flex'>
            <Box marginLeft='31px'>
              <Box><Typography variant='p' color='#989898'>Liquidity</Typography></Box>
              <Box mt='15px'>
                <Typography variant='p_xlg'>
                  {infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Wrapper>}

      <Box>
        <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '590px', marginTop: '12px', marginBottom: '12px' }}>
          <StyledTab value={TAB_COLLATERAL} label='Collateral' />\
          <StyledTab value={TAB_POSITIONS} label='Positions' />
        </StyledTabs>
      </Box>

      <PanelBox>
        <TabPanel value={tab} index={TAB_COLLATERAL}>
          <Comet />
        </TabPanel>
        <TabPanel value={tab} index={TAB_POSITIONS}>
          <GridBorrow />
        </TabPanel>
      </PanelBox>
    </div>
  )
}

const Wrapper = styled(Box)`
  min-height: 550px;
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
