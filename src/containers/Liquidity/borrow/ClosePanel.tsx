import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'

const ClosePanel = () => {
  const onClose = () => {
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <PositionInfo />
      </Grid>
      <Grid item xs={12} md={8}>
        <Box sx={{ padding: '30px' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
            <DetailHeader>Repay-Burn amount</DetailHeader>
            <DetailValue>1.00 iLTC</DetailValue>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <DetailHeader>Withdraw amount</DetailHeader>
            <DetailValue>179.49 USDC</DetailValue>
          </Stack>
          <StyledDivider />
          <ActionButton onClick={onClose}>Close</ActionButton>
        </Box>
      </Grid>
    </Grid>
  )
}

const StyledDivider = styled(Divider)`
  background-color: #535353;
  margin-bottom: 39px;
  margin-top: 39px;
  height: 1px;
`

const DetailHeader = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
`

const DetailValue = styled('div')`
  font-size: 18px;
  font-weight: 500;
  color: #fff;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default ClosePanel