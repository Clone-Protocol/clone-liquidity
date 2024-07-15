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
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchCheckReferralCode, fetchLinkDiscordAccess, fetchLinkDiscordAccessLedger, fetchLinkReferralCode } from '~/utils/fetch_netlify'
import ReferralTextDialog from '~/components/Points/ReferralTextDialog'
import { useEffect, useState } from 'react'
import ReferralCodePutDialog from '~/components/Points/ReferralCodePutDialog'
import useLocalStorage from '~/hooks/useLocalStorage'
import { CURRENT_ACCOUNT, IS_COMPLETE_INIT_REFER, IS_CONNECT_LEDGER } from '~/data/localstorage'
import { isFetchingReferralCode, rpcEndpoint, showReferralCodeDlog } from '~/features/globalAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { LinkDiscordAccessStatus, generateDiscordLinkMessage } from 'functions/link-discord-access/link-discord-access'
import { discordUsername } from '~/features/globalAtom'
import { useSnackbar } from 'notistack'
import { getCloneClient } from '~/features/baseQuery'
import { generateDiscordLinkRawMessage } from 'functions/link-discord-access-ledger/link-discord-access-ledger'
import { buildAuthTx } from '~/utils/ledger'

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
  const { publicKey, connected, signMessage, signTransaction } = useWallet()
  const setAtomShowReferralCodeDlog = useSetAtom(showReferralCodeDlog)
  const setAtomIsFetchingReferralCode = useSetAtom(isFetchingReferralCode)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  //for referral 
  const [isCompleteInitRefer, _] = useLocalStorage(IS_COMPLETE_INIT_REFER, false)
  const [localAccount, setLocalAccount] = useLocalStorage(CURRENT_ACCOUNT, '')
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
        setAtomIsFetchingReferralCode(true)
        fetchCheckReferralCode(publicKey.toString()).then((res) => {
          console.log('res', res)
          if (res.successful) {
            setShowReferralCodePutDlog(true)

            // check if already clicked "No" or localAccount is changed
            if (!isCompleteInitRefer || localAccount !== publicKey.toString()) {
              // show referral code dialog before open account
              setAtomShowReferralCodeDlog(true)
            }
          }
        }).finally(() => {
          setAtomIsFetchingReferralCode(false)
        })
      }
    }
  }, [connected, publicKey, refCode, isCompleteInitRefer])

  //for discord accesstoken
  const networkEndpoint = useAtomValue(rpcEndpoint)
  const setDiscordUsername = useSetAtom(discordUsername)
  const [isConnectLedger, setIsConnectLedger] = useLocalStorage(IS_CONNECT_LEDGER, false)
  const discordAccessToken = params.get('accessToken')
  useEffect(() => {
    const signAccessToken = async () => {
      if (publicKey && discordAccessToken && signMessage) {
        try {
          let signature

          if (!isConnectLedger) {
            signature = await signMessage(generateDiscordLinkMessage(discordAccessToken))
          } else {
            console.log('ledger mode')
            const tx = await buildAuthTx(generateDiscordLinkRawMessage(discordAccessToken));
            tx.feePayer = publicKey;
            const { cloneClient: cloneProgram } = await getCloneClient(networkEndpoint)
            tx.recentBlockhash = (await cloneProgram?.provider.connection.getLatestBlockhash()).blockhash

            const signedTx = await signTransaction!(tx);
            signature = signedTx.serialize();
          }
          console.log('s', signature)

          if (signature) {
            const { result }: { result: LinkDiscordAccessStatus } = isConnectLedger ? await fetchLinkDiscordAccessLedger(
              publicKey.toString(), bs58.encode(signature), discordAccessToken
            ) : await fetchLinkDiscordAccess(
              publicKey.toString(), bs58.encode(signature), discordAccessToken
            )

            setIsConnectLedger(false)

            if (result === LinkDiscordAccessStatus.SUCCESS) {
              enqueueSnackbar('Successfully linked', { variant: 'success' })
              setDiscordUsername('signed')
            } else if (result === LinkDiscordAccessStatus.ADDRESS_ALREADY_LINKED) {
              enqueueSnackbar('Address already linked', { variant: 'warning' })
              setDiscordUsername('signed')
            } else {
              enqueueSnackbar('Failed to sign message', { variant: 'error' })
            }
          }
        } catch (e) {
          console.error('e', e)
          enqueueSnackbar('Failed to sign message', { variant: 'error' })
        } finally {
          router.replace('/')
        }
      }
    }
    signAccessToken()
  }, [discordAccessToken, signMessage])

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
