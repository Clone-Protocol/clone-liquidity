import { Box, Paper, Stack, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import BorrowPanel from '../Overview/BorrowPanel'
import PriceChart from '~/components/Overview/PriceChart'
import PositionAnalytics from '~/components/Borrow/PositionAnalytics'
import { ASSETS } from '~/data/assets'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon.svg'
import TipMsg from '~/components/Common/TipMsg'

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
          <TipMsg><Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about how Borrowing works.</Typography></TipMsg>
          <LeftBoxWrapper>
            <Box paddingY='10px'>
              <BorrowPanel assetIndex={assetIndex} onChooseAssetIndex={handleChooseAssetIndex} />
            </Box>
          </LeftBoxWrapper>
        </Box>

        <RightBoxWrapper>
          <StickyBox>
            <PriceChart assetData={borrowAsset} isOraclePrice={true} priceTitle='Oracle Price' />
            <PositionAnalytics tickerSymbol={borrowAsset.tickerSymbol} />
          </StickyBox>
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
  margin-top: 16px;
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
export default withSuspense(BorrowContainer, <LoadingProgress />)
