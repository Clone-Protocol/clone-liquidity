import { Box, Grid } from '@mui/material'
import { styled } from '@mui/system'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import InfoTooltip from '~/components/Common/InfoTooltip'

interface Props {
  assetData: PI
	cometData: CometInfo
  currentLowerLimit: number
  currentUpperLimit: number
  onChange: any
}

const EditConcentrationRangeBox: React.FC<Props> = ({ assetData, cometData, currentLowerLimit, currentUpperLimit, onChange }) => {
  const handleChangeLowerLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) {
			const limit = parseFloat(e.currentTarget.value)
      onChange(limit, true)
    }
  }

  const handleChangeUpperLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) {
			const limit = parseFloat(e.currentTarget.value)
      onChange(limit, false)
    }
  }

	return cometData ? (
		<Grid container spacing={2}>
			<Grid item xs={4}>
				<Box
					sx={{
						fontSize: '12px',
						fontWeight: '500',
						color: '#809cff',
						textAlign: 'center',
						marginBottom: '5px',
					}}>
					Lower Limit <InfoTooltip title="lower limit" />
				</Box>
				<Box
					sx={{
						borderRadius: '10px',
						border: 'solid 1px #809cff',
            background: '#252627'
					}}>
					<PriceValue><InputAmount disabled type="number" step=".01" value={parseFloat(cometData.lowerLimit.toFixed(4))} min={0} max={assetData.price-0.01} onChange={handleChangeLowerLimit} /></PriceValue>
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
          <CurrentPrice style={{ borderTop: '1px solid #809cff'}}><span style={{ fontSize: '9px' }}>Current:</span> {currentLowerLimit.toLocaleString()} USD</CurrentPrice>
				</Box>
			</Grid>
			<Grid item xs={4}>
				<Box
					sx={{
						fontSize: '12px',
						fontWeight: '500',
						color: '#FFF',
						textAlign: 'center',
						marginBottom: '5px',
					}}>
					Center Price <InfoTooltip title="center price" />
				</Box>
				<Box sx={{ borderRadius: '10px', border: 'solid 1px #444', background: '#252627'}}>
					<PriceValue style={{ background: '#171717' }}>{assetData.price.toLocaleString()}</PriceValue>
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
          <CurrentPrice style={{ borderTop: '1px solid #444'}}><span style={{ fontSize: '9px' }}>Current:</span> {assetData.price.toLocaleString()} USD</CurrentPrice>
				</Box>
			</Grid>
			<Grid item xs={4}>
				<Box
					sx={{
						fontSize: '12px',
						fontWeight: '500',
						color: '#2e5cff',
						textAlign: 'center',
						marginBottom: '5px',
					}}>
					Upper Limit <InfoTooltip title="upper limit" />
				</Box>
				<Box
					sx={{
						borderRadius: '10px',
						border: 'solid 1px #2e5cff',
            background: '#252627'
					}}>
					<PriceValue><InputAmount disabled type="number" step=".01" value={parseFloat(cometData.upperLimit.toFixed(4))} min={assetData.price+0.01} onChange={handleChangeUpperLimit} /></PriceValue>
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
          <CurrentPrice style={{ borderTop: '1px solid #0038ff'}}><span style={{ fontSize: '9px' }}>Current:</span> {currentUpperLimit.toLocaleString()} USD</CurrentPrice>
				</Box>
			</Grid>
		</Grid>
	) : (
		<></>
	)
}

const PriceValue = styled('div')`
  background: #171717;
	font-size: 16px;
	font-weight: 500;
	text-align: center;
  padding-top: 8px;
  padding-bottom: 8px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`

const InputAmount = styled(`input`)`
	width: 100px;
	border: 0px;
	background: #171717;
	font-size: 16px;
	font-weight: 500;
	color: #fff;
  text-align: center;
  margin-left: 12px;
`

const RangePair = styled('div')`
  background: #171717;
  border-top: 1px solid #444;
	font-size: 12px;
	font-weight: 500;
	padding-top: 8px;
  padding-bottom: 8px;
	text-align: center;
  color: #9a9a9a;
`

const CurrentPrice = styled('div')`
  font-size: 12px;
  font-weight: 500;
  padding-top: 6px;
  padding-bottom: 6px;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #949494;
`

export default withCsrOnly(EditConcentrationRangeBox)
