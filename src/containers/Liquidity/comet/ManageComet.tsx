import React, { useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import TipMsg from '~/components/Common/TipMsg'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon.svg'
import { TabPanelForEdit, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import EditPanel from '~/containers/Liquidity/comet/EditPanel'
import ClosePanel from '~/containers/Liquidity/comet/ClosePanel'
import { useCometDetailQuery } from '~/features/MyLiquidity/CometPosition.query'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import ManageCometIconOff from 'public/images/manage-icon-off.svg'
import ManageCometIconOn from 'public/images/manage-icon-on.svg'
import ManageCloseIconOff from 'public/images/close-circle-multiple-outline-off.svg'
import ManageCloseIconOn from 'public/images/close-circle-multiple-outline-on.svg'
import PriceChart from '~/components/Overview/PriceChart'
import PoolAnalytics from '~/components/Overview/PoolAnalytics'
import DisabledCloseCometWarningMsg from '~/components/Liquidity/comet/DisabledCloseCometWarningMsg'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { GoBackButton } from '~/components/Common/CommonButtons'

const ManageComet = ({ assetId }: { assetId: string }) => {
  const { publicKey } = useWallet()
  const [tab, setTab] = useState(0)
  const [isCloseTabFixed, setIsCloseTabFixed] = useState(false)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    if (!isCloseTabFixed) {
      setTab(newValue)
    }
  }
  const router = useRouter()
  const cometIndex = parseInt(assetId)

  const { data: cometDetail, refetch } = useCometDetailQuery({
    userPubKey: publicKey,
    index: cometIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  })

  const { data: usdiBalance } = useBalanceQuery({
    userPubKey: publicKey,
    refetchOnMount: true,
    enabled: publicKey != null
  });

  useEffect(() => {
    console.log('cometDetail', cometDetail)
    // if step1 is finished, goes to close comet as fix
    if (cometDetail && cometDetail.centerPrice === 0) {
      setTab(1)
      setIsCloseTabFixed(true)
    }
  }, [cometDetail])

  return (cometDetail && usdiBalance) ? (
    <Stack direction='row' spacing={3} justifyContent="center">
      <Box>
        <GoBackButton onClick={() => router.back()}><Typography variant='p'>Go back</Typography></GoBackButton>
        <Box mb='10px'><Typography variant='p_xxlg'>Manage Comet Liquidity Position</Typography></Box>
        <LeftBoxWrapper>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label="Manage Comet" icon={tab === 0 ? <Image src={ManageCometIconOn} /> : <Image src={ManageCometIconOff} />}></StyledTab>
            <StyledTab value={1} label="Close Comet" icon={tab === 1 ? <Image src={ManageCloseIconOn} /> : <Image src={ManageCloseIconOff} />}></StyledTab>
          </StyledTabs>
          <StyledDivider />
          <TipMsg>
            <Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about how managing comet position works.</Typography>
          </TipMsg>
          <TabPanelForEdit value={tab} index={0}>
            <EditPanel assetId={assetId} cometDetail={cometDetail} balance={usdiBalance.balanceVal} onRefetchData={() => refetch()} />
          </TabPanelForEdit>
          <TabPanelForEdit value={tab} index={1}>
            <ClosePanel assetId={assetId} cometDetail={cometDetail} onRefetchData={() => refetch()} />
          </TabPanelForEdit>
        </LeftBoxWrapper>
      </Box>
      <RightBoxWrapper>
        <StickyBox>
          {(tab === 0 || (tab === 1 && (cometDetail.mintIassetAmount !== 0 && cometDetail.mintAmount !== 0))) &&
            <Box>
              <PriceChart assetData={cometDetail} priceTitle='iAsset Price' />
              <PoolAnalytics tickerSymbol={cometDetail.tickerSymbol} />
            </Box>
          }
          {tab === 1 && cometDetail.mintIassetAmount === 0 && cometDetail.mintAmount === 0 &&
            <Box>
              <DisabledCloseCometWarningMsg />
            </Box>
          }
        </StickyBox>
      </RightBoxWrapper>
    </Stack>
  ) : <></>
}


const LeftBoxWrapper = styled(Box)`
	width: 521px; 
	padding: 8px 25px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	margin-bottom: 25px;
`
const RightBoxWrapper = styled(Box)`
	width: 450px;
	padding: 20px;
`
const StickyBox = styled(Box)`
  position: sticky;
  top: 100px;
`

export default withSuspense(ManageComet, <LoadingProgress />)
