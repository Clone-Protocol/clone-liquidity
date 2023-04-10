import { useState } from 'react'
import { Box, Stack, Divider, Typography } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import HealthscoreView from '~/components/Liquidity/multipool/HealthscoreView'
import InfoTooltip from '~/components/Common/InfoTooltip';
import { TooltipTexts } from '~/data/tooltipTexts'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import Image from 'next/image'
import EditIcon from 'public/images/edit-icon.svg'
import { SubmitButton } from '~/components/Common/CommonButtons'
import ConcentrationRangeView from './ConcentrationRangeView'

interface Props {
  assetData: PI
  cometDetail: CometDetail
  onShowEditForm: () => void
  onRecenter: () => void
}

const PositionInfo: React.FC<Props> = ({ assetData, cometDetail, onShowEditForm, onRecenter }) => {
  const cometData = {
    isTight: false,
    collRatio: 50,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  }

  const [isEditBtnHover, setIsEditBtnHover] = useState(false)

  return assetData ? (
    <PositionWrapper>
      <BoxWithBorder padding="15px 24px">
        <Box position='relative'>
          <Box padding='12px' sx={{ minWidth: '365px' }}>
            <Box paddingX='20px'>
              <Box><Typography variant='p_lg' color='#989898'>Collateral</Typography></Box>
              <Box>
                <Typography variant='p_xxlg'>{cometDetail.collAmount.toLocaleString()} USDi</Typography>
              </Box>
            </Box>
            <StyledDivider />
            <Box marginTop='10px'>
              <Box paddingX='20px'>
                <Box><Typography variant='p_lg' color='#989898'>Contributed Liquidity</Typography></Box>
                <Box mb='10px'>
                  <Typography variant='p_xxlg'>${cometDetail.contributedLiquidity?.toLocaleString()} USD</Typography>
                </Box>
                <Stack direction="row" justifyContent="space-between">
                  <Box><Typography variant='p' color='#989898'>Contributed USDi</Typography></Box>
                  <Box>
                    <Typography variant='p'>{cometDetail.mintAmount.toLocaleString()} USDi</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Box><Typography variant='p' color='#989898'>Contributed iAsset</Typography></Box>
                  <Box>
                    <Typography variant='p'>{cometDetail.mintIassetAmount!.toLocaleString(undefined, { maximumFractionDigits: 5 })} {assetData.tickerSymbol}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
            <StyledDivider />

            <Box paddingX='20px'>
              <Box mb='15px'><Typography variant='p_lg' color='#989898'>Concentration Range</Typography></Box>
              {/* <ConcentrationRange
                assetData={assetData}
                cometData={cometData}
                max={assetData.maxRange}
                defaultLower={(assetData.price / 2)}
                defaultUpper={((assetData.price * 3) / 2)}
              /> */}
              <ConcentrationRangeView
                centerPrice={assetData.price}
                lowerLimit={cometData.lowerLimit}
                upperLimit={cometData.upperLimit}
                max={assetData.maxRange}
              />
            </Box>
            <ConcentrationRangeBox assetData={assetData} cometData={cometData} />
          </Box>
          {isEditBtnHover && <OverlayEditCometInfo><Typography variant='p'>Edit Comet Position</Typography></OverlayEditCometInfo>}
          <EditBox onMouseOver={() => setIsEditBtnHover(true)} onMouseLeave={() => setIsEditBtnHover(false)} onClick={onShowEditForm}>
            <Image src={EditIcon} />
          </EditBox>
        </Box>
      </BoxWithBorder>

      <StyledDivider />

      <Stack direction='row'>
        <Box width='45%' marginLeft='15px'>
          <Box mb='10px'><Typography variant='p' color='#989898'>Comet Health Score <InfoTooltip title={TooltipTexts.healthScoreCol} /></Typography></Box>
          <HealthscoreView score={cometDetail.healthScore} />
        </Box>
        <Box display='flex' width='50%'>
          <ColumnDivider />
          <Box ml='35px' mb='10px'>
            <Box><Typography variant='p' color='#989898'>ILD Debt <InfoTooltip title={TooltipTexts.ildCol} /></Typography></Box>
            <Box height='82px' display='flex' alignItems='center'>
              <Typography variant='p_xlg'>{Math.abs(cometDetail.ild).toFixed(2)} USDi</Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
      <StyledDivider />

      <SubmitButton onClick={onRecenter} disabled={cometDetail.collAmount == 0}><Typography variant='p_lg'>Recenter</Typography></SubmitButton>

      <Box display='flex' justifyContent='center'>
        <DataLoadingIndicator />
      </Box>
    </PositionWrapper>
  ) : (
    <></>
  )
}

const PositionWrapper = styled(Box)`
  color: #fff; 
  padding: 20px 5px; 
`
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 15px;
	margin-top: 15px;
	height: 1px;
`
const EditBox = styled(Box)`
  position: absolute;
  top: -15px;
  left: -24px;
  width: 44px;
  height: 44px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`
const ColumnDivider = styled('div')`
  background: #363636; 
  width: 1px; 
  height: 120px;
  margin-top: 10px;
`
const OverlayEditCometInfo = styled(Box)`
  position: absolute;
  top: -18px;
  left: -24px;
  width: 460px;
  height: 460px;
  padding: 0 0 27px 0;
  background-color: rgba(27, 27, 27, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
`

export default withCsrOnly(PositionInfo)
