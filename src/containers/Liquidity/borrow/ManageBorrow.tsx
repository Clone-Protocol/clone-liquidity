import React, { useState } from 'react'
import { Stack, Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import TipMsg from '~/components/Common/TipMsg'
import { useWallet } from '@solana/wallet-adapter-react'
import InfoIcon from 'public/images/info-icon.svg'
import { TabPanelForEdit, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import ManageCometIconOff from 'public/images/manage-icon-off.svg'
import ManageCometIconOn from 'public/images/manage-icon-on.svg'
import ManageCloseIconOff from 'public/images/close-circle-multiple-outline-off.svg'
import ManageCloseIconOn from 'public/images/close-circle-multiple-outline-on.svg'
import EditPanel from '~/containers/Liquidity/borrow/EditPanel'
import ClosePanel from '~/containers/Liquidity/borrow/ClosePanel'
import { useBorrowPositionQuery } from '~/features/MyLiquidity/BorrowPosition.query'
import { usePriceHistoryQuery } from '~/features/Chart/PriceByAsset.query'
import PriceChart from '~/components/Overview/PriceChart'
import PositionAnalytics from '~/components/Borrow/PositionAnalytics'
import { StyledDivider } from '~/components/Common/StyledDivider'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'

const ManageBorrow = ({ assetId }: { assetId: string }) => {
  const { publicKey } = useWallet()
  const [tab, setTab] = useState(0)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const borrowIndex = parseInt(assetId)

  const { data: borrowDetail, refetch } = useBorrowPositionQuery({
    userPubKey: publicKey,
    index: borrowIndex,
    refetchOnMount: "always",
    enabled: publicKey != null
  });

  const { data: priceHistory } = usePriceHistoryQuery({
    pythSymbol: borrowDetail?.pythSymbol,
    isOraclePrice: true,
    refetchOnMount: false,
    enabled: borrowDetail != null
  })

  return (borrowDetail && priceHistory) ? (
    <Stack direction='row' spacing={3} justifyContent="center">
      <Box>
        <Box mb='25px'><Typography variant='p_xxlg'>Manage Borrow Position</Typography></Box>
        <TipMsg>
          <Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about how Borrowing works.</Typography>
        </TipMsg>
        <LeftBoxWrapper mt='21px'>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label="Manage Borrow Position" icon={tab === 0 ? <Image src={ManageCometIconOn} /> : <Image src={ManageCometIconOff} />}></StyledTab>
            <StyledTab value={1} label="Close Borrow Position" icon={tab === 1 ? <Image src={ManageCloseIconOn} /> : <Image src={ManageCloseIconOff} />}></StyledTab>
          </StyledTabs>
          <StyledDivider />
          <TipMsg>
            <Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about how managing borrow position works.</Typography>
          </TipMsg>
          <TabPanelForEdit value={tab} index={0}>
            <EditPanel assetId={assetId} borrowDetail={borrowDetail} onRefetchData={() => refetch()} />
          </TabPanelForEdit>
          <TabPanelForEdit value={tab} index={1}>
            <ClosePanel assetId={assetId} borrowDetail={borrowDetail} />
          </TabPanelForEdit>

          <Box display='flex' justifyContent='center'>
            <DataLoadingIndicator onRefresh={() => refetch()} />
          </Box>
        </LeftBoxWrapper>
      </Box>
      <RightBoxWrapper>
        <StickyBox>
          <PriceChart assetData={borrowDetail} isOraclePrice={true} priceTitle='Oracle Price' />
          <PositionAnalytics tickerSymbol={borrowDetail.tickerSymbol} />
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

export default withSuspense(ManageBorrow, <LoadingProgress />)
