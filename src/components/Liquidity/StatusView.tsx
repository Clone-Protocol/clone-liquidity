import { styled, Box, Paper, Stack } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { Status } from '~/web3/MyLiquidity/status'

interface Props {
	status: Status
}

const StatusView: React.FC<Props> = ({ status }) => {
	return status ? (
		<StyledPaper variant="outlined">
			<Box sx={{ marginBottom: '40px' }}>
				<Title>Total Value</Title>
				<BalanceValue>
					<NumValue>{status.totalVal.toLocaleString()}</NumValue> USDi
				</BalanceValue>
			</Box>
			{/* <Stack spacing={2}>
				<Box>
					<SubHeader>Comet:</SubHeader>
					<SubValue>
						{status.comet.toLocaleString()} USDi ({status.cometPercent}%)
					</SubValue>
				</Box>
				<Box>
					<SubHeader>Unconcentrated:</SubHeader>
					<SubValue>
						{status.unconcentrated.toLocaleString()} USDi ({status.unconcentratedPercent}%)
					</SubValue>
				</Box>
				<Box>
					<SubHeader>Borrow:</SubHeader>
					<SubValue>
						{status.borrow.toLocaleString()} USDi ({status.borrowPercent}%)
					</SubValue>
				</Box>
			</Stack> */}
		</StyledPaper>
	) : (
		<></>
	)
}

export default withCsrOnly(StatusView)

const StyledPaper = styled(Paper)`
	font-size: 14px;
	font-weight: 500;
	background-image: linear-gradient(to bottom, rgba(21, 22, 24, 0.75) 100%, #002888 -159%);
	color: #fff;
	padding: 49px 48px 49px 51px;
	border-radius: 10px;
	height: 168px;
`
const Title = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	margin-bottom: 10px;
`

const BalanceValue = styled('div')`
	font-size: 24px;
	font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
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
