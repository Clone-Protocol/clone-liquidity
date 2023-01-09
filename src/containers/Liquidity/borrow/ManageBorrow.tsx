import React, { useState } from 'react'
import { Stack, Box } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { TabPanelForEdit, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import MiniLineChartAlt from '~/components/Charts/MiniLineChartAlt'
import EditPanel from '~/containers/Liquidity/borrow/EditPanel'
import ClosePanel from '~/containers/Liquidity/borrow/ClosePanel'
import { useBorrowPositionQuery } from '~/features/MyLiquidity/BorrowPosition.query'
import { usePriceHistoryQuery } from '~/features/Chart/PriceByAsset.query'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

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
    tickerSymbol: borrowDetail?.tickerSymbol,
    refetchOnMount: false,
    enabled: borrowDetail != null
  })

  const editBorrowPositionTabLabel = <React.Fragment>Edit Borrow Position <InfoTooltip title={TooltipTexts.editBorrowPosition} /> </React.Fragment>
  const closeBorrowPositionTabLabel = <React.Fragment>Close Borrow Position <InfoTooltip title={TooltipTexts.closeBorrowPosition} /> </React.Fragment>

  return (borrowDetail && priceHistory) ? (
    <Stack direction='row' spacing={2} justifyContent="center">
			<Box>
        <StyledBox>
          <Box display="flex">
            <Image src={borrowDetail.tickerIcon} width="30px" height="30px" />
            <Box sx={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: '#fff', marginTop: '3px' }}>
              {borrowDetail.tickerName} ({borrowDetail.tickerSymbol})
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px', marginBottom: '27px', fontSize: '24px', fontWeight: '500', color: '#fff' }}>
            ${borrowDetail.oPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            {priceHistory.rateOfPrice >= 0 ?
              <TxtPriceRate>+${priceHistory.rateOfPrice.toFixed(3)} (+{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
            :
              <TxtPriceRate style={{ color: '#ec5e2a' }}>-${Math.abs(priceHistory.rateOfPrice).toFixed(3)} (-{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
            }
          </Box>
          <MiniLineChartAlt 
            data={priceHistory?.chartData}
            color={ priceHistory.rateOfPrice >= 0 ? '#59c23a' : '#ec5e2a'}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: '#6c6c6c', marginTop: '10px' }}>
            <Box>
              Oracle Price
              <InfoTooltip title={TooltipTexts.oraclePrice} />
            </Box>
          </Box>
        </StyledBox>
			</Box>
			<Box>
        <Box sx={{ width: '466px', marginLeft: '18px' }}>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label={editBorrowPositionTabLabel}></StyledTab>
            <StyledTab value={1} label={closeBorrowPositionTabLabel}></StyledTab>
          </StyledTabs>
          <TabPanelForEdit value={tab} index={0}>
            <EditPanel assetId={assetId} borrowDetail={borrowDetail} onRefetchData={() => refetch()}   />
          </TabPanelForEdit>
          <TabPanelForEdit value={tab} index={1}>
            <ClosePanel assetId={assetId} borrowDetail={borrowDetail} />
          </TabPanelForEdit>
        </Box>
			</Box>
		</Stack>
  ) : <></>
}

const StyledBox = styled(Box)`
  width: 315px;
  height: 290px;
  padding: 17px 34px 18px 35px;
  border-radius: 10px;
  background: rgba(21, 22, 24, 0.75);
`

const TxtPriceRate = styled('div')`
  font-size: 10px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #59c23a;
`

export default withSuspense(ManageBorrow, <LoadingProgress />)
