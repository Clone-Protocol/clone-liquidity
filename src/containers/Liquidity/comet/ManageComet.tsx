import React, { useEffect, useState } from 'react'
import { Grid, Box, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { TabPanelForEdit, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import MiniLineChartAlt from '~/components/Charts/MiniLineChartAlt'
import EditPanel from '~/containers/Liquidity/comet/EditPanel'
import ClosePanel from '~/containers/Liquidity/comet/ClosePanel'
import { useCometDetailQuery } from '~/features/MyLiquidity/CometPosition.query'
import { usePriceHistoryQuery } from '~/features/Chart/PriceByAsset.query'
// import { fetchPools, PoolList } from '~/features/MyLiquidity/CometPools.query'

const ManageComet = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
  const [tab, setTab] = useState(0)
	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	const cometIndex = parseInt(assetId)

  const { data: cometDetail } = useCometDetailQuery({
    userPubKey: publicKey,
    index: cometIndex,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

  const { data: priceHistory } = usePriceHistoryQuery({
    tickerSymbol: cometDetail?.tickerSymbol,
    refetchOnMount: false,
    enabled: cometDetail != null
  })

	return (cometDetail && priceHistory) ? (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
        <StyledBox>
          <Box display="flex">
            <Image src={cometDetail.tickerIcon} width="30px" height="30px" />
            <Box sx={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: '#fff', marginTop: '3px' }}>
              {cometDetail.tickerName} ({cometDetail.tickerSymbol})
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px', marginBottom: '27px', fontSize: '24px', fontWeight: '500', color: '#fff' }}>
            ${cometDetail.price.toFixed(2)}
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
            Indicator Price
          </Box>
        </StyledBox>
			</Grid>
			<Grid item xs={12} md={8}>
        <Box sx={{ maxWidth: '466px', marginLeft: '18px' }}>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label="Edit Comet"></StyledTab>
            <StyledTab value={1} label="Close Comet"></StyledTab>
          </StyledTabs>
          <TabPanelForEdit value={tab} index={0}>
            <EditPanel assetId={assetId} cometDetail={cometDetail} />
          </TabPanelForEdit>
          <TabPanelForEdit value={tab} index={1}>
            <ClosePanel assetId={assetId} cometDetail={cometDetail} />
          </TabPanelForEdit>
        </Box>
			</Grid>
		</Grid>
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

export default withSuspense(ManageComet, <LoadingProgress />)
