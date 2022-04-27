import { Box } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import WarningIcon from 'public/images/warning-icon-red.png'
import { PositionInfo as PI } from '~/features/MyLiquidity/BorrowPosition.query'

interface Props {
	positionInfo: PI
}

const PositionInfo: React.FC<Props> = ({ positionInfo }) => {
	return positionInfo ? (
		<Box sx={{ background: '#000', color: '#fff' }}>
			<PriceIndicatorBox
				tickerIcon={positionInfo.tickerIcon}
				tickerSymbol={positionInfo.tickerSymbol}
				value={positionInfo.oPrice}
			/>

			<Box sx={{ background: '#171717', color: '#fff', padding: '25px', marginTop: '15px' }}>
				{/* <WarningBox><Image src={WarningIcon} /> High liquidation risk</WarningBox> */}

				<Title>Borrow Position</Title>
				<Box>
					<Box>
						<SubTitle>Current collateral</SubTitle>
						<Box sx={{ fontSize: '16px', fontWeight: '500' }}>{positionInfo.collateralAmount} USDi</Box>

						<SubTitle>Current collateral ratio</SubTitle>
						<Box sx={{ fontSize: '16px', fontWeight: '500', color: '#ff2929' }}>
							{positionInfo.collateralRatio.toFixed(2)}% (min:{' '}
							{positionInfo.minCollateralRatio.toFixed(2)}%)
						</Box>

						<SubTitle>Borrowed amount</SubTitle>
						<Box sx={{ fontSize: '16px', fontWeight: '500' }}>
							{positionInfo.borrowedIasset.toFixed(2)} {positionInfo.tickerSymbol}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	) : (
		<></>
	)
}

const WarningBox = styled(Box)`
	font-size: 12px;
	font-weight: 500;
	color: #ff2929;
	padding: 3px 29px 2px 46px;
	border-radius: 10px;
	border: solid 1px #f00;
	text-align: center;
	margin-bottom: 20px;
`

const Title = styled('div')`
	font-size: 20px;
	font-weight: 600;
	color: #fff;
	margin-bottom: 20px;
`

const SubTitle = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	margin-top: 10px;
	margin-bottom: 10px;
`

export default withCsrOnly(PositionInfo)
