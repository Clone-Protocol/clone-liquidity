import { Box, Stack, Button, Divider } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import ConcentrationRangeView from '~/components/Liquidity/comet/ConcentrationRangeView'

interface Props {
	assetData: PI
	cometData: CometInfo
  mintAmount: number
	collateralAmount: number
}

const PositionInfo: React.FC<Props> = ({ assetData, cometData, mintAmount, collateralAmount }) => {
	const onRecenter = () => {}

	return assetData ? (
		<Box sx={{ background: '#000', color: '#fff' }}>
			<PriceIndicatorBox
				tickerIcon={assetData.tickerIcon}
				tickerName={assetData.tickerName}
				tickerSymbol={assetData.tickerSymbol}
				value={assetData.price}
			/>

			<Box sx={{ background: '#171717', color: '#fff', padding: '25px 30px', marginTop: '15px' }}>
				<Title>Comet Position</Title>
				<Box>
					<Box>
						<SubTitle>Collateral</SubTitle>
						<Box sx={{ fontSize: '18px', fontWeight: '500' }}>
							{collateralAmount} <span style={{ fontSize: '14px' }}>USDi</span>
						</Box>
						<Box sx={{ marginTop: '10px' }}>
							<Stack direction="row" justifyContent="space-between">
								<DetailHeader>Contributed USDi</DetailHeader>
								<DetailValue>
									{collateralAmount} USDi
								</DetailValue>
							</Stack>
							<Stack direction="row" justifyContent="space-between">
								<DetailHeader>Contributed iAsset</DetailHeader>
								<DetailValue>
									{mintAmount} {assetData.tickerSymbol}
								</DetailValue>
							</Stack>
						</Box>
					</Box>
					<StyledDivider />

					<Box>
						<SubTitle>Price Range</SubTitle>
						<Box sx={{ marginTop: '20px' }}>
              <ConcentrationRangeView 
                assetData={assetData}
                cometData={cometData}
                max={assetData.maxRange}
              />
							<Stack direction="row" justifyContent="space-between">
								<DetailHeader>Center price</DetailHeader>
								<DetailValue>{assetData?.centerPrice.toFixed(2)} USDi</DetailValue>
							</Stack>
							<Stack direction="row" justifyContent="space-between">
								<DetailHeader>Lower limit</DetailHeader>
								<DetailValue>
									{cometData.lowerLimit.toFixed(2)} USDi
								</DetailValue>
							</Stack>
							<Stack direction="row" justifyContent="space-between">
								<DetailHeader>Upper limit</DetailHeader>
								<DetailValue>
									{cometData.upperLimit.toFixed(2)} USDi
								</DetailValue>
							</Stack>
						</Box>
					</Box>
					<StyledDivider />

					{/* <Box>
            <SubTitle>ILD</SubTitle>
            <Box sx={{ fontSize: '18px', fontWeight: '500' }}>
              {positionInfo.ild} USDi
            </Box>
          </Box>
          <StyledDivider /> */}

					<ActionButton onClick={onRecenter}>Recenter</ActionButton>
				</Box>
			</Box>
		</Box>
	) : (
		<></>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 15px;
	margin-top: 15px;
	height: 1px;
`

const Title = styled('div')`
	font-size: 20px;
	font-weight: 600;
	color: #fff;
	margin-bottom: 20px;
`

const SubTitle = styled('div')`
	font-size: 16px;
	font-weight: 600;
	color: #989898;
`

const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #fff;
`

const ActionButton = styled(Button)`
	width: 100%;
	border-radius: 10px;
	border-style: solid;
	border-width: 2px;
	border-image-source: linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
	border-image-slice: 1;
  font-size: 18px;
  font-weight: 500;
	color: #fff;
`

export default withCsrOnly(PositionInfo)
