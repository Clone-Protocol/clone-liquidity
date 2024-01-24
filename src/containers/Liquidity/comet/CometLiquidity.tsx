import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { StyledTabs, CommonTab } from '~/components/Common/StyledTab'
import { useWallet } from '@solana/wallet-adapter-react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import Collaterals from './Collaterals'

import LiquidityPositions from './LiquidityPositions'
import CometLiquidityStatus from './CometLiquidityStatus'

// export const TAB_COLLATERAL = 0
// export const TAB_POSITIONS = 1

const CometLiquidity = () => {
  // const [tab, setTab] = useState(TAB_COLLATERAL)
  const { publicKey } = useWallet()
  const { data: infos, refetch } = useCometInfoQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  return (
    <div>
      <Typography variant='h3' fontWeight={500}>Comet Liquidity</Typography>
      <CometLiquidityStatus infos={infos} />

      <Box>
        <StyledTabs value={0} sx={{ maxWidth: '590px', marginTop: '12px' }}>
          <CommonTab value={0} label='Collateral' />
        </StyledTabs>

        <PanelBox>
          <Collaterals hasNoCollateral={infos ? infos.hasNoCollateral : false} collaterals={infos?.collaterals || []} />
        </PanelBox>
      </Box>

      <Box>
        <StyledTabs value={0} sx={{ maxWidth: '590px', marginTop: '12px' }}>
          <CommonTab value={0} label='Positions' />
        </StyledTabs>

        <PanelBox>
          <LiquidityPositions hasNoCollateral={infos ? infos.hasNoCollateral : false} positions={infos?.positions || []} onRefetchData={() => refetch()} />
        </PanelBox>
      </Box>
    </div>
  )
}

const PanelBox = styled(Box)`
  // min-height: 250px;
  margin-bottom: 40px;
  color: #fff;
`

export default withSuspense(CometLiquidity, <LoadingProgress />)
