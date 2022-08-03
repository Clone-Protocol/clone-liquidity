import { styled } from '@mui/material'
import { Box, Input } from '@mui/material'
import Image from 'next/image'
import SearchIcon from 'public/images/search-icon.svg'

interface Props {
  onChange?: any
}
const SearchInput: React.FC<Props> = ({onChange}) => {
	return <StyledBox>
    <StyledInput placeholder="Search for iAsset Liquidity Pool" disableUnderline onChange={onChange} />
    <Box sx={{ position: 'relative', right: '-10px', top: '0px' }}>
      <Image src={SearchIcon} />
    </Box>
  </StyledBox>
}

const StyledBox = styled(Box)`
  display: flex;
  width: 270px;
  height: 36px;
  color: #fff;
  padding: 6px 20px 6px 24px;
  border-radius: 8px;
  border: solid 1px #444;
  background-color: #282828;
  &:hover {
    border: solid 1px #809cff;
  }
`

const StyledInput = styled(Input)`
  & input {
    width: 206px;
    height: 30px;
    font-size: 11px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #fff;

    &::placeholder {
      color: #fff;
    }
  }
`

export default SearchInput
