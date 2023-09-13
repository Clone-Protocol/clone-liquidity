import { Box, Typography, styled } from "@mui/material"
import { SubmitButton } from "~/components/Common/CommonButtons"



const Rewards = () => {

  return (
    <>
      <Box>
        <Box><Typography variant='p_lg'>onAsset Rewards</Typography></Box>
        <BoxWithBorder>
          <Typography variant='p_lg'>4.465775 onETH</Typography>
          <Typography variant='p_lg' color='#66707e'>($6,456.45 USD)</Typography>
        </BoxWithBorder>
      </Box>
      <Box>
        <Box><Typography variant='p_lg'>devUSD Rewards</Typography></Box>
        <BoxWithBorder>
          <Typography variant='p_lg'>4.465775 devUSD</Typography>
        </BoxWithBorder>
      </Box>
      <SubmitButton onClick={() => { }} disabled={false}>
        <Typography variant='p_xlg'>Claim Rewards</Typography>
      </SubmitButton>
    </>
  )
}

const BoxWithBorder = styled(Box)`
  width: 100%;
  height: 52px;
  display: flex;
  margin-top: 15px;
  margin-bottom: 38px;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 18px 21px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`

export default Rewards