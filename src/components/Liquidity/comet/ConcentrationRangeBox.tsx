import { Box, Grid } from '@mui/material'
import { styled } from '@mui/system'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PositionInfo as PI } from '~/web3/MyLiquidity/CometPosition'

interface Props {
  positionInfo: PI
}

const ConcentrationRangeBox: React.FC<Props> = ({ positionInfo }) => {

  return positionInfo ? (
    <Grid container spacing={2}>
      <Grid item xs>
        <Box
          sx={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#00f0ff',
            textAlign: 'center',
            marginBottom: '5px',
          }}>
          Lower Limit
        </Box>
        <Box
          sx={{
            background: 'linear-gradient(180deg, #333333 55%, #171717 45%)',
            borderRadius: '10px',
            border: 'solid 1px #00f0ff',
            padding: '18px',
          }}>
          <PriceValue>{positionInfo.lowerLimit.toFixed(2)}</PriceValue>
          <RangePair>USD / {positionInfo.tickerSymbol}</RangePair>
        </Box>
      </Grid>
      <Grid item xs={3}>
        <Box
          sx={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#FFF',
            textAlign: 'center',
            marginBottom: '5px',
          }}>
          Center Price
        </Box>
        <Box sx={{ borderRadius: '10px', border: 'solid 1px #FFF', padding: '18px' }}>
          <PriceValue>{positionInfo.price.toFixed(2)}</PriceValue>
          <RangePair>USDi / {positionInfo.tickerSymbol}</RangePair>
        </Box>
      </Grid>
      <Grid item xs>
        <Box
          sx={{
            fontSize: '15px',
            fontWeight: '500',
            color: '#809cff',
            textAlign: 'center',
            marginBottom: '5px',
          }}>
          Upper Limit
        </Box>
        <Box
          sx={{
            background: 'linear-gradient(180deg, #333333 55%, #171717 45%)',
            borderRadius: '10px',
            border: 'solid 1px #809cff',
            padding: '18px',
          }}>
          <PriceValue>{positionInfo.upperLimit.toFixed(2)}</PriceValue>
          <RangePair>USDi / {positionInfo.tickerSymbol}</RangePair>
        </Box>
      </Grid>
    </Grid>
  ) : <></>
}

const PriceValue = styled('div')`
	font-size: 20px;
	font-weight: 500;
	text-align: center;
`

const RangePair = styled('div')`
	font-size: 13px;
	font-weight: 500;
	padding-top: 10px;
	text-align: center;
`

export default withCsrOnly(ConcentrationRangeBox)