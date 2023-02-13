import { Box, Paper, Stack } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import BorrowPanel from '../Overview/BorrowPanel'
import PriceChart from '~/components/Overview/PriceChart'
import PositionAnalytics from '~/components/Borrow/PositionAnalytics'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { ASSETS } from '~/data/assets'

const BorrowContainer = () => {
  const router = useRouter()
  const { lAssetId } = router.query
  const [assetIndex, setAssetIndex] = useState(0)
  const [borrowAsset, setBorrowAsset] = useState(ASSETS[0])

  // sub routing for asset id
  useEffect(() => {
    if (lAssetId) {
      setAssetIndex(parseInt(lAssetId.toString()))
      setBorrowAsset(ASSETS[parseInt(lAssetId.toString())])
    }
  }, [lAssetId])

  const handleChooseAssetIndex = (index: number) => {
    setAssetIndex(index)
    setBorrowAsset(ASSETS[index])
  }

  return borrowAsset ? (
    <StyledBox>
      <Stack direction='row' spacing={3} justifyContent="center">
        <Box>
          <LeftBoxWrapper>
            <Box paddingY='10px'>
              <BorrowPanel assetIndex={assetIndex} onChooseAssetIndex={handleChooseAssetIndex} />
            </Box>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator />
            </Box>
          </LeftBoxWrapper>
        </Box>

        <RightBoxWrapper>
          <PriceChart assetData={borrowAsset} priceTitle='Oracle Price' />
          <PositionAnalytics tickerSymbol={borrowAsset.tickerSymbol} />
        </RightBoxWrapper>
      </Stack>
    </StyledBox>
  ) : <></>
}

const StyledBox = styled(Paper)`
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	color: #fff;
	border-radius: 8px;
	text-align: left;
	background: #000;
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
export default withSuspense(BorrowContainer, <LoadingProgress />)
