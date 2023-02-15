import React, { useEffect, useState } from 'react'
import { Box, Stack, Divider, Typography } from '@mui/material'
import { styled } from '@mui/system'
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
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import PriceChart from '~/components/Overview/PriceChart'
import PoolAnalytics from '~/components/Overview/PoolAnalytics'

const ManageComet = ({ assetId }: { assetId: string }) => {
  const { publicKey } = useWallet()
  const [tab, setTab] = useState(0)
  const [isCloseTabFixed, setIsCloseTabFixed] = useState(false)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    if (!isCloseTabFixed) {
      setTab(newValue)
    }
  }

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

  const editCometTabLabel = <React.Fragment>Edit Comet <InfoTooltip title={TooltipTexts.editCometTab} /> </React.Fragment>
  const closeCometTabLabel = <React.Fragment>Close Comet <InfoTooltip title={TooltipTexts.closeCometTab} /> </React.Fragment>

  return (cometDetail && usdiBalance) ? (
    <Stack direction='row' spacing={3} justifyContent="center">
      <Box>
        <LeftBoxWrapper>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label={editCometTabLabel}></StyledTab>
            <StyledTab value={1} label={closeCometTabLabel}></StyledTab>
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
        {(tab === 0 && cometDetail.tickerIcon) &&
          <Box>
            <PriceChart assetData={cometDetail} priceTitle='iAsset Price' />
            <PoolAnalytics tickerSymbol={cometDetail.tickerSymbol} />
          </Box>
        }
      </RightBoxWrapper>
    </Stack>
  ) : <></>
}
const StyledDivider = styled(Divider)`
	background-color: ${(props) => props.theme.boxes.blackShade};
	margin-bottom: 11px;
	margin-top: 11px;
	height: 1px;
`
const LeftBoxWrapper = styled(Box)`
	width: 607px; 
	padding: 8px 25px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	margin-bottom: 25px;
`
const RightBoxWrapper = styled(Box)`
	width: 450px;
	padding: 20px;
`

export default withSuspense(ManageComet, <LoadingProgress />)
