import { Box, Button, Grid, styled } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { CellTicker } from '~/components/Common/DataGrid'

export interface PositionInfo {
  tickerIcon: string
	tickerName: string
	tickerSymbol: string
  claimableAmount: number
}

interface Props {
  positionInfo: PositionInfo,
  hasHeader: boolean
}

const LiquidatedPositionRow: React.FC<Props> = ({ positionInfo, hasHeader = false }) => {

  return (
    <Wrapper>
      {hasHeader &&
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={5}><TxtHeader>Token</TxtHeader></Grid>
            <Grid item xs={4}><TxtHeader>Claimable amount</TxtHeader></Grid>
            <Grid item xs={3}></Grid>
          </Grid>
        </Box>
        }
      <Grid container spacing={2} sx={{ marginTop: '5px', borderRadius: '10px', backgroundColor: '#1d1d1d', height: '52px' }}>
        <Grid item xs={5} sx={{ color: '#fff', marginTop: '-3px' }}><CellTicker tickerIcon={positionInfo.tickerIcon} tickerName={positionInfo.tickerName} tickerSymbol={positionInfo.tickerSymbol} /></Grid>
        <Grid item xs={4}><div style={{ fontSize: '11px', fontWeight: '500', color: '#fff', marginTop: '2px' }}>{positionInfo.claimableAmount} {positionInfo.tickerSymbol}</div></Grid>
        <Grid item xs={3}><BtnClaim>Claim</BtnClaim></Grid>
      </Grid>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  margin-top: 15px;
`

const TxtHeader = styled('div')`
  font-size: 11px;
  font-weight: 500;
  color: #989898;
`

const BtnClaim = styled(Button)`
  width: 83px;
  height: 26px;
  flex-grow: 0;
  padding: 4px 0;
  border-radius: 10px;
  border: solid 1px #535353;
  background-color: #000;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  margin-top: -3px;
`

export default withCsrOnly(LiquidatedPositionRow)