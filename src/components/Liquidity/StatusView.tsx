import { styled, Box, Paper, Stack } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'

const StatusView: React.FC = () => {

  return (
    <StyledPaper variant="outlined">
      <Box sx={{ marginBottom: '40px' }}>
        <Title>Total Value</Title>
        <BalanceValue><NumValue>100000</NumValue> USDi</BalanceValue>
      </Box>
      <Stack spacing={2}>
        <Box>
          <SubHeader>Comet:</SubHeader>
          <SubValue>45,000.00 USDi (45%)</SubValue>
        </Box>
        <Box>
          <SubHeader>Unconcentrated:</SubHeader>
          <SubValue>45,000.00 USDi (45%)</SubValue>
        </Box>
        <Box>
          <SubHeader>Borrow:</SubHeader>
          <SubValue>10,000.00 USDi (10%)</SubValue>
        </Box>
      </Stack>
    </StyledPaper>
  )
}

export default withCsrOnly(StatusView)

const StyledPaper = styled(Paper)`
  font-size: 14px;
  font-weight: 500;
  background: #000;
  color: #FFF;
  padding: 49px 48px 49px 51px;
  border-radius: 8px;
  border: solid 1px #e4e9ed;
  width: 675px;
  height: 357px;
`
const Title = styled('div')`
  font-size: 18px;
  font-weight: 500;
  color: #989898;
  margin-bottom: 10px;
`

const BalanceValue = styled('div')`
  font-size: 20px;
  font-weight: 600;
`

const NumValue = styled('span')`
  font-size: 32px;
`

const SubHeader = styled('div')`
  font-size: 12px;
  color: #989898;
`

const SubValue = styled('div')`
  font-size: 13px;
  font-weight: 500;
`