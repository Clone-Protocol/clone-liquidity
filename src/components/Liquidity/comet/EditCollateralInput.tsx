import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'
import { StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { useState } from 'react'

interface Props {
	tickerIcon: string
	tickerName?: string | null
	tickerSymbol: string | null
	value?: number
	onChange?: any
}

const EditCollateralInput: React.FC<Props> = ({
	tickerIcon,
	tickerSymbol,
	value,
	onChange,
}) => {
  const [tab, setTab] = useState(0)
	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="flex-end">
        <Box sx={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px', background: '#252627', border: '1px solid #444' }}>
          <StyledTabs value={tab} onChange={handleChangeTab}>
            <StyledTab value={0} label="Deposit"></StyledTab>
            <StyledTab value={1} label="Withdraw"></StyledTab>
          </StyledTabs>
        </Box>
        <Box>
          Max withdrawable: 60,000 USDC
        </Box>
      </Stack>
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</Box>
				</Box>
				<InputAmount id="ip-amount" type="number" value={value} onChange={onChange} />
			</FormStack>
      <Box>
        Current Collateral: 80,450.85 USDC
      </Box>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  border: solid 1px #444444;
	border-radius: 8px;
	background-color: #333333;
  &:hover {
    border: solid 1px #809cff;
  }
`

const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 600;
  margin-top: 3px;
`

const InputAmount = styled(`input`)`
	width: 330px;
	margin-left: 30px;
	text-align: right;
	border: 0px;
	background-color: #333333;
	font-size: 16px;
	font-weight: 500;
	color: #fff;
`

export default EditCollateralInput
