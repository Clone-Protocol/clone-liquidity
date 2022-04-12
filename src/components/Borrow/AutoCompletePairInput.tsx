import { FormControl, styled, Stack, Box, Select, MenuItem, Autocomplete, TextField } from '@mui/material'
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

const SelectPairInput: React.FC<Props> = ({ assets, selAssetId, onChangeAsset }) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
        <Autocomplete
          options={assets}
          sx={{ width: 315 }}
          selectOnFocus
          clearOnBlur
          freeSolo
          onChange={(e) => onChangeAsset(e.target.value)}
          renderInput={(params) => <TextField {...params} label="Search for an iAsset" />}
        />

				{/* <Select
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
								</Box>
							</Box>
						</MenuItem>
					))}
				</Select> */}
			</FormStack>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 13px 21px 13px 30px;
	border-radius: 8px;
	background-color: #333333;
`

const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 600;
`

const TickerName = styled('div')`
	color: #757a7f;
	font-size: 9px;
	font-weight: 600;
	line-height: 5px;
`

export default SelectPairInput
