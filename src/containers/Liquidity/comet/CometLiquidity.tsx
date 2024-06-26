import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { StyledTabs, CommonTab } from '~/components/Common/StyledTab'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { fetchPositionsApy, useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import Collaterals from './Collaterals'
import LearnMoreIcon from 'public/images/learn-more.svg'
import LiquidityPositions from './LiquidityPositions'
import CometLiquidityStatus from './CometLiquidityStatus'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useClone } from '~/hooks/useClone'

const CometLiquidity = () => {
  const { publicKey } = useWallet()
  const { data: infos, refetch } = useCometInfoQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })
  // const { data: apyInfos, refetch: refetchApys } = usePositionsApyQuery({
  //   userPubKey: publicKey,
  //   refetchOnMount: false,
  //   enabled: false
  // })
  const [totalApy, setTotalApy] = useState(0)
  const [positionsApys, setPositionsApys] = useState<number[]>([])
  const wallet = useAnchorWallet()
  const { getCloneApp } = useClone()

  useEffect(() => {
    const fetchApy = async () => {
      if (publicKey && infos?.positions && infos.positions.length > 0) {
        try {
          const program = await getCloneApp(wallet)
          const apyInfo = await fetchPositionsApy({ program, userPubKey: publicKey })

          if (apyInfo && apyInfo.totalApy > 0) {
            setTotalApy(apyInfo.totalApy)
            setPositionsApys(apyInfo.apys)
          }
        } catch (err) {
          console.error('e', err)
        }
      } else {
        console.log('no positions')
      }
    }
    fetchApy()
  }, [publicKey])

  return (
    <div>
      <Box>
        <Typography variant='h3' fontWeight={500}>Comet Liquidity</Typography>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography variant='p' color='#66707e'>While Comet excels in capital-efficiency, users need advanced knowledge to maximize yield and minimize risk.</Typography>
          <a href="https://docs.clone.so/clone-mainnet-guide/clone-liquidity-or-for-lps/comets" target='_blank' rel="noreferrer">
            <Box display='flex' color='#b5fdf9' sx={{ cursor: 'pointer', ":hover": { color: '#4fe5ff' } }}>
              <Typography variant='p' mr='3px'>Learn more</Typography>
              <Image src={LearnMoreIcon} alt='learnMore' />
            </Box>
          </a>
        </Stack>
      </Box>

      <CometLiquidityStatus infos={infos} totalApy={totalApy} />

      <Box>
        <StyledTabs value={0} sx={{ maxWidth: '590px', marginTop: '12px' }}>
          <CommonTab value={0} label='Collateral' />
        </StyledTabs>

        <PanelBox>
          <Collaterals hasNoCollateral={infos ? infos.hasNoCollateral : false} collaterals={infos?.collaterals || []} onRefetchData={() => refetch()} />
        </PanelBox>
      </Box>

      <Box>
        <StyledTabs value={0} sx={{ maxWidth: '590px', marginTop: '12px' }}>
          <CommonTab value={0} label='Positions' />
        </StyledTabs>

        <PanelBox>
          <LiquidityPositions hasNoCollateral={infos ? infos.hasNoCollateral : false} positions={infos?.positions || []} positionsApys={positionsApys} onRefetchData={() => refetch()} />
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
