'use client'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import GetUSDiBadge from '~/components/Overview/GetUSDiBadge'
import MainChart from '~/containers/Overview/MainChart'
import AssetList from '~/containers/Overview/AssetList'
import { useWallet } from '@solana/wallet-adapter-react'
import { DEV_RPCs, IS_DEV, MAIN_RPCs } from '~/data/networks'
import { DehydratedState, HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { IS_NOT_LOCAL_DEVELOPMENT } from '~/utils/constants'
import { fetchAssets } from '~/features/Overview/Assets.query'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { fetchTotalVolume } from '~/features/Chart/Liquidity.query'
import { useSearchParams } from 'next/navigation'
import { fetchCheckReferralCode, fetchLinkReferralCode } from '~/utils/fetch_netlify'
import ReferralTextDialog from '~/components/Points/ReferralTextDialog'
import { useEffect, useState } from 'react'
import ReferralCodePutDialog from '~/components/Points/ReferralCodePutDialog'
import useLocalStorage from '~/hooks/useLocalStorage'
import { IS_COMPLETE_INIT_REFER } from '~/data/localstorage'
import { showReferralCodeDlog } from '~/features/globalAtom'
import { useSetAtom } from 'jotai'

//SSR
export const getStaticProps = (async () => {
  const queryClient = new QueryClient()

  if (IS_NOT_LOCAL_DEVELOPMENT) {
    console.log('prefetch')
    await queryClient.prefetchQuery({ queryKey: ['totalVolume'], queryFn: () => fetchTotalVolume({ timeframe: '30d' }) })
    await queryClient.prefetchQuery({ queryKey: ['assets'], queryFn: () => fetchAssets({ setShowPythBanner: () => { }, mainCloneClient: null, networkEndpoint: IS_DEV ? DEV_RPCs[0].rpc_url : MAIN_RPCs[0].rpc_url }) })
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
  const { publicKey, connected } = useWallet()
  const setAtomShowReferralCodeDlog = useSetAtom(showReferralCodeDlog)

  //for referral 
  const [isCompleteInitRefer, _] = useLocalStorage(IS_COMPLETE_INIT_REFER, false)
  const params = useSearchParams()
  const refCode = params.get('referralCode')
  const [showReferralTextDialog, setShowReferralTextDialog] = useState(false)
  const [showReferralCodePutDlog, setShowReferralCodePutDlog] = useState(false)
  const [referralStatus, setReferralStatus] = useState(0)

  useEffect(() => {
    if (connected && publicKey) {
      if (refCode) {
        console.log('refCode', refCode)
        fetchLinkReferralCode(publicKey.toString(), parseInt(refCode).toString()).then((res) => {
          console.log('res', res)
          const { status } = res
          setReferralStatus(status)
          setShowReferralCodePutDlog(false)
          setShowReferralTextDialog(true)
        })
      } else {
        fetchCheckReferralCode(publicKey.toString()).then((res) => {
          console.log('res', res)
          if (res.successful) {
            setShowReferralCodePutDlog(true)

            if (!isCompleteInitRefer) {
              // show referral code dialog before open account
              setAtomShowReferralCodeDlog(true)
            }
          }
        })
      }
    }
  }, [connected, publicKey, refCode])

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
          <HydrationBoundary state={dehydratedState}>
            <AssetList />
          </HydrationBoundary>
        </Box>

        <ReferralTextDialog referralStatus={referralStatus} open={showReferralTextDialog} handleClose={() => setShowReferralTextDialog(false)} />
        <ReferralCodePutDialog open={showReferralCodePutDlog && !isCompleteInitRefer} handleClose={() => { setAtomShowReferralCodeDlog(false); setShowReferralCodePutDlog(false); }} />
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
