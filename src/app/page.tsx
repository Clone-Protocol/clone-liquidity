'use client'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import GetUSDiBadge from '~/components/Overview/GetUSDiBadge'
import MainChart from '~/containers/Overview/MainChart'
import AssetList from '~/containers/Overview/AssetList'
import { useWallet } from '@solana/wallet-adapter-react'
import { IS_DEV } from '~/data/networks'

const Overview = () => {
  const { publicKey } = useWallet()
  return (
    <div>
      <StyledSection>
        <Box sx={{ maxWidth: '1270px' }} margin='0 auto'>
          {IS_DEV && publicKey &&
            <GetUSDiBadge />
          }
          <Box mt='25px'>
            <Box mb='19px'>
              <MainChart />
            </Box>
            <AssetList />
          </Box>
        </Box>
      </StyledSection>
    </div>
  )
}

export const StyledSection = styled('section')`
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 80px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Overview
