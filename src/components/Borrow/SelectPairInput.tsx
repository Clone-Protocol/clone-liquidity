import { FormControl, styled, Stack, Box, Select, MenuItem } from '@mui/material'
import Image from 'next/image'

interface AssetType {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
}

interface Props {
	assets: AssetType[]
	selAssetId: number
	value?: number
	onChangeAsset?: any
	onChangeAmount?: any
}

const SelectPairInput: React.FC<Props> = ({ assets, selAssetId, value, onChangeAsset, onChangeAmount }) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Select
					sx={{ color: '#fff' }}
					id="selectAsset"
					label=""
					value={selAssetId}
					onChange={(e) => onChangeAsset(e.target.value)}>
					{assets.map((asset, index) => (
						<MenuItem key={index} value={index}>
							<Box display="flex">
								<Image src={asset.tickerIcon} width="28px" height="28px" />
								<Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
									<TickerSymbol>{asset.tickerSymbol}</TickerSymbol>
									<TickerName>{asset.tickerName}</TickerName>
								</Box>
							</Box>
						</MenuItem>
					))}
				</Select>
				<InputAmount id="ip-amount" type="number" value={value} onChange={onChangeAmount} />
			</FormStack>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 95%;
	height: 65px;
	padding: 15px 25px 14px 34px;
	border-radius: 8px;
	background-color: #333333;
`

const TickerSymbol = styled('div')`
	font-size: 15px;
	font-weight: 600;
`

const TickerName = styled('div')`
	color: #757a7f;
	font-size: 9px;
	font-weight: 600;
	line-height: 5px;
`

const InputAmount = styled(`input`)`
	width: 330px;
	margin-left: 30px;
	text-align: right;
	border: 0px;
	background-color: #333333;
	font-size: 20px;
	font-weight: 500;
	color: #757a7f;
`

export default SelectPairInput
