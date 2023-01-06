import React, { useEffect, useState } from 'react'
import { Box, Stack } from '@mui/material'
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
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

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

  const { data: priceHistory } = usePriceHistoryQuery({
    tickerSymbol: cometDetail?.tickerSymbol,
    refetchOnMount: false,
    enabled: cometDetail != null
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
		<Stack direction='row' spacing={2} justifyContent="center">
      { (tab === 0 && cometDetail.tickerIcon) &&
			  <Box>
          <StyledBox>
            <Box display="flex">
              <Box>
                <Image src={cometDetail.tickerIcon} width={30} height={30} />
              </Box>
              <Box sx={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: '#fff', marginTop: '3px' }}>
                {cometDetail.tickerName} ({cometDetail.tickerSymbol})
              </Box>
            </Box>
            <Box sx={{ marginTop: '20px', marginBottom: '27px', fontSize: '24px', fontWeight: '500', color: '#fff' }}>
              ${cometDetail.price.toLocaleString(undefined, { maximumFractionDigits: 3 })}
              {/* {priceHistory.rateOfPrice >= 0 ?
                <TxtPriceRate>+${priceHistory.rateOfPrice.toFixed(3)} (+{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
              :
                <TxtPriceRate style={{ color: '#ec5e2a' }}>-${Math.abs(priceHistory.rateOfPrice).toFixed(3)} (-{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
              } */}
            </Box>
            { priceHistory && 
              <MiniLineChartAlt 
                data={priceHistory.chartData}
                color={ priceHistory.rateOfPrice >= 0 ? '#59c23a' : '#ec5e2a'}
              />
            }
            <Box sx={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: '#6c6c6c', marginTop: '10px' }}>
              <Box>iAsset Price <InfoTooltip title={TooltipTexts.iAssetPrice} /></Box>
            </Box>
          </StyledBox>
			  </Box>
      }
			<Box>
        <Box sx={{ width: '466px', marginLeft: '18px' }}>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label={editCometTabLabel}></StyledTab>
            <StyledTab value={1} label={closeCometTabLabel}></StyledTab>
          </StyledTabs>
          <TabPanelForEdit value={tab} index={0}>
            <EditPanel assetId={assetId} cometDetail={cometDetail} balance={usdiBalance.balanceVal} onRefetchData={() => refetch()} />
          </TabPanelForEdit>
          <TabPanelForEdit value={tab} index={1}>
            <ClosePanel assetId={assetId} cometDetail={cometDetail} onRefetchData={() => refetch()} />
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

export default withSuspense(ManageComet, <LoadingProgress />)
