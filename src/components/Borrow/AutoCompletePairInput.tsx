import { FormControl, styled, Stack, Box, Select, MenuItem, Autocomplete, TextField, InputAdornment } from '@mui/material'
import Image from 'next/image'
import SearchIcon from 'public/images/search-icon.png'

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
		<Box>
      <StyledAutocomplete
        selectOnFocus
        clearOnBlur
        freeSolo
        onChange={(e) => onChangeAsset(e.target.value)}
        options={assets.map((asset) => asset.tickerName)}
        renderInput={(params) => <StyledTextField {...params} label="Search for an iAsset" />}
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
    </Box>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 315px;
	height: 54px;
	padding-left: 20px;
  padding-right: 20px;
	border-radius: 8px;
  border: solid 1px #809cff;
  background-color: #151618;
  font-size: 11px;
  font-weight: 500;
`

const StyledAutocomplete = styled(Autocomplete)`
  width: 315px; 
  height: 36px;
  border: solid 1px #809cff;
  border-radius: 8px;
  & label {
    font-size: 11px;
    font-weight: 500;
    color: #989898;
    padding: 0;
    line-height: 3px;
    overflow: initial;
  }

  & .MuiOutlinedInput-root {
    padding: 0;
    padding-left: 20px;
    padding-right: 20px;
  }

  & .MuiAutocomplete-inputRoot {
    padding: 0;
    padding-left: 20px;
  }

  & input {
    width: 315px;
    height: 24px;
    color: #989898;
  }
`

const StyledTextField = styled(TextField)`
  line-height: 3px;
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
