import { Box, Stack, Button, Divider, Typography } from '@mui/material'
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

  const contributedLiquidity = 805043.02

  return assetData ? (
    <PositionWrapper>
      <BoxWithBorder padding="15px 24px">
        <Box position='relative'>
          <Box padding='22px' sx={{ minWidth: '365px' }}>
            <Box><Typography variant='p_lg' color='#989898'>Collateral</Typography></Box>
            <Box>
              <Typography variant='p_xxlg'>{cometDetail.collAmount.toLocaleString()} USDi</Typography>
            </Box>
            <Box marginTop='10px'>
              <Box><Typography variant='p_lg' color='#989898'>Contributed Liquidity</Typography></Box>
              <Box>
                <Typography variant='p_xxlg'>${contributedLiquidity.toLocaleString()} USD</Typography>
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
            <StyledDivider />

            <Box><Typography variant='p_lg' color='#989898'>Concentration Range</Typography></Box>
            <Box mt='25px'>
              {/* <ConcentrationRangeView
                centerPrice={assetData?.centerPrice}
                lowerLimit={cometData.lowerLimit}
                upperLimit={cometData.upperLimit}
              /> */}
              <ConcentrationRange
                assetData={assetData}
                cometData={cometData}
                max={assetData.maxRange}
                defaultLower={(assetData.price / 2)}
                defaultUpper={((assetData.price * 3) / 2)}
              />
              <ConcentrationRangeBox assetData={assetData} cometData={cometData} />
            </Box>
          </Box>
          <EditBox onClick={onShowEditForm}>
            <Image src={EditIcon} />
          </EditBox>
        </Box>
      </BoxWithBorder>
      <StyledDivider />

      <Stack direction='row'>
        <Box width='45%' marginLeft='15px'>
          <Box mb='10px'><Typography variant='p' color='#989898'>Comet Health Score <InfoTooltip title={TooltipTexts.healthScoreCol} /></Typography></Box>
          {/* <HealthScoreValue>
            {formatHealthScore(cometDetail.healthScore)}/100
          </HealthScoreValue> */}
          <HealthscoreView score={cometDetail.healthScore} />
        </Box>
        <Box display='flex' width='50%'>
          <ColumnDivider />
          <Box ml='35px' mb='10px'>
            <Box><Typography variant='p' color='#989898'>ILD Dept <InfoTooltip title={TooltipTexts.ildCol} /></Typography></Box>
            <Box height='82px' display='flex' alignItems='center'>
              <Typography variant='p_xlg'>{Math.abs(cometDetail.ild).toFixed(2)} USDi</Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
      <StyledDivider />

      <ActionButton onClick={onRecenter} disabled={cometDetail.collAmount == 0}>Recenter</ActionButton>

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
  padding: 25px 30px; 
  margin-top: 15px;
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
const ActionButton = styled(Button)`
  width: 100%;
  background-color: ${(props) => props.theme.palette.primary.main};
  color: #000;
  border-radius: 0px;
  margin-top: 15px;
  margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`
const ColumnDivider = styled('div')`
  background: #535353; 
  width: 1px; 
  height: 122px;
`

export default withCsrOnly(PositionInfo)
