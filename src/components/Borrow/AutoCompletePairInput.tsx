import { FormControl, styled, Stack, Box, Autocomplete, TextField, Popper } from '@mui/material'
import Image from 'next/image'
import SearchIcon from 'public/images/search-icon.png'

export interface AssetType {
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

const CustomPopper = function (props) {
  return <StyledPopper {...props} placement="bottom" />;
};

const SelectPairInput: React.FC<Props> = ({ assets, selAssetId, onChangeAsset }) => {
	return (
		<Box sx={{ display: 'flex'}}>
      <StyledAutocomplete
        selectOnFocus
        clearOnBlur
        onChange={(e, value) => onChangeAsset(value)}
        getOptionLabel={(option) => option.tickerName}
        options={assets}
        PopperComponent={CustomPopper}
        renderInput={(params) => <StyledTextField {...params} placeholder="Search for an iAsset" />}
        renderOption={(props, option) => (
          <SelectBox key={option.tickerSymbol} {...props}>
            <Image src={option.tickerIcon} width="24px" height="24px" />
            <TickerName>{option.tickerName} ({option.tickerSymbol})</TickerName>
          </SelectBox>
        )}
      />

      <Box sx={{ position: 'relative', right: '30px', top: '5px' }}>
        <Image src={SearchIcon} />
      </Box>

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
    &::placeholder {
      color: #fff;
    }
  }
`

const StyledPopper = styled(Popper)`
  background: #151618;
  & .MuiAutocomplete-listbox {
    background: #151618;
    border-radius: 10px;
    border: solid 1px #444;

    & :hover {
      background: #444444;
    }
  }
`

const SelectBox = styled(Box)`
  display: flex;
  padding: 13px 15px 17px;
  background-color: #151618;
`

const StyledTextField = styled(TextField)`
  line-height: 3px;
`

const TickerName = styled('div')`
  color: #fff;
	font-size: 12px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  margin: 5px;
`

export default SelectPairInput
