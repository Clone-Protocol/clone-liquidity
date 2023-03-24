import { styled } from '@mui/system'
import { Box } from '@mui/material'

export const GoBackButton = styled(Box)`
  color: ${(props) => props.theme.palette.text.secondary};
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`