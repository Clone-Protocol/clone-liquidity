import { styled, Divider } from "@mui/material"

export const StyledDivider = styled(Divider)`
  background-color: ${(props) => props.theme.boxes.blackShade};
  margin-bottom: 15px;
  margin-top: 15px;
  height: 1px;
`