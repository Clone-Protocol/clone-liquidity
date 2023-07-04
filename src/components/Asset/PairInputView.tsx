import { FormControl, styled, Stack, Box, Typography } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
	dollarPrice?: number
}

const PairInputView: React.FC<Props> = ({ tickerIcon, tickerSymbol, value, dollarPrice }) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex" alignItems='center'>
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box ml='10px'>
						<Typography variant='p_lg'>{tickerSymbol}</Typography>
					</Box>
				</Box>
				<Box lineHeight={0.93} textAlign='right'>
					<Box><Typography variant='p_xlg'>{value?.toFixed(8)}</Typography></Box>
					<Box>{dollarPrice ? <Typography variant='p' color='#989898'>${dollarPrice.toLocaleString()} USD</Typography> : <></>}</Box>
				</Box>
			</FormStack>
		</FormControl >
	)
}

const FormStack = styled(Stack)`
	width: 100%;
	height: 70px;
	padding: 9px 21px 8px 24px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default PairInputView
