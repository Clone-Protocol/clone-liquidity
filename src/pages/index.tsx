'use client'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import GetUSDiBadge from '~/components/Overview/GetUSDiBadge'
import MainChart from '~/containers/Overview/MainChart'
import AssetList from '~/containers/Overview/AssetList'
import { useWallet } from '@solana/wallet-adapter-react'
import { DEV_RPCs, IS_DEV, MAIN_RPCs } from '~/data/networks'
import { DehydratedState, Hydrate, QueryClient, dehydrate } from '@tanstack/react-query'
import { IS_NOT_LOCAL_DEVELOPMENT } from '~/utils/constants'
import { fetchAssets } from '~/features/Overview/Assets.query'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { fetchTotalVolume } from '~/features/Chart/Liquidity.query'

//SSR
export const getStaticProps = (async () => {
  const queryClient = new QueryClient()

  if (IS_NOT_LOCAL_DEVELOPMENT) {
    console.log('prefetch')
    await queryClient.prefetchQuery(['totalVolume'], () => fetchTotalVolume({ timeframe: '7d' }))
    await queryClient.prefetchQuery(['assets'], () => fetchAssets({ setShowPythBanner: () => { }, mainCloneClient: null, networkEndpoint: IS_DEV ? DEV_RPCs[0].rpc_url : MAIN_RPCs[0].rpc_url }))
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      //cached time
      revalidate: 12,
    },
  }
}) satisfies GetStaticProps<{
  dehydratedState: DehydratedState
}>

const Overview = ({ dehydratedState }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { publicKey } = useWallet()
  return (
    <StyledSection>
      <Box sx={{ maxWidth: '1270px' }} margin='0 auto'>
        {IS_DEV && publicKey &&
          <GetUSDiBadge />
        }
        <Box mt='25px'>
          <Box mb='19px'>
            <MainChart />
          </Box>
          <Hydrate state={dehydratedState}>
            <AssetList />
          </Hydrate>
        </Box>
      </Box>
    </StyledSection>
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
