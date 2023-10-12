import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { TabPanel, StyledTabs, CommonTab } from '~/components/Common/StyledTab'
import { useWallet } from '@solana/wallet-adapter-react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import Collaterals from './Collaterals'

import LiquidityPositions from './LiquidityPositions'
import CometLiquidityStatus from './CometLiquidityStatus'

export const TAB_COLLATERAL = 0
export const TAB_POSITIONS = 1

const CometLiquidity = ({ ltab }: { ltab: string }) => {
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
      <CometLiquidityStatus infos={infos} />

      <Box>
        <StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '590px', marginTop: '12px' }}>
          <CommonTab value={TAB_COLLATERAL} label='Collateral' />\
          <CommonTab value={TAB_POSITIONS} label='Positions' />
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

const PanelBox = styled(Box)`
  min-height: 250px;
  margin-bottom: 25px;
  color: #fff;
  & .super-app-theme--header { 
    color: #9d9d9d; 
    font-size: 13px; 
  }
`

export default withSuspense(CometLiquidity, <LoadingProgress />)
