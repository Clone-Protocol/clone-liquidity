import { styled } from '@mui/material'
import { Box, Input } from '@mui/material'
import Image from 'next/image'
import SearchIcon from 'public/images/search-icon.svg'

interface Props {
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
}
const SearchInput: React.FC<Props> = ({ onChange }) => {
  return <StyledBox>
    <StyledInput placeholder="Search onAssets" disableUnderline onChange={onChange} />
    <Box sx={{ position: 'relative', left: '-228px', top: '5px' }}>
      <Image src={SearchIcon} alt='search' />
    </Box>
  </StyledBox>
}

const StyledBox = styled(Box)`
  display: flex;
  width: 328px;
  height: 36px;
  color: #fff;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
  border-radius: 5px;
  padding: 0;
  &:hover {
    border-color: ${(props) => props.theme.basis.liquidityBlue};
  }
`

const StyledInput = styled(Input)`
  & input {
    width: 206px;
    height: 30px;
    font-size: 12px;
    font-weight: 500;
    text-align: left;
    color: #fff;
    margin-left: 35px;

    &::placeholder {
      color: #fff;
    }
  }
`

export default SearchInput
