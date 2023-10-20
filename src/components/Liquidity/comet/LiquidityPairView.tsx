//@DEPRECATED
import { styled, Stack, Box, Typography } from "@mui/material"
import Image from "next/image"
import { CloseButton, PayIldButton } from "~/components/Liquidity/LiquidityButton"

interface Props {
  poolIndex: number
  tickerIcon: string
  tickerSymbol: string | null
  value?: number
  ildValue?: number
  ildInUsdi: boolean
  rewards?: number
  onShowEditDialog: (poolIndex: number) => void
  onShowClosePositionDialog: (poolIndex: number) => void
}

const LiquidityPairView: React.FC<Props> = ({
  poolIndex,
  tickerIcon,
  tickerSymbol,
  value,
  ildValue,
  ildInUsdi,
  rewards,
  onShowEditDialog,
  onShowClosePositionDialog,
}) => {
  const showClosePositionDialog = (e: any) => {
    e.stopPropagation()
    onShowClosePositionDialog(poolIndex)
  }

  return (
    <Box display="flex">
      <FormStack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        onClick={() => onShowEditDialog(poolIndex)}>
        <Box display="flex">
          <Image src={tickerIcon} width={28} height={28} alt={tickerSymbol!} />
          <TickerWrapper>
            <Typography variant="p" whiteSpace='nowrap'>{tickerSymbol} / devUSD</Typography>
          </TickerWrapper>
        </Box>
        <Box width='100px' textAlign='right'>
          <Typography variant="p" whiteSpace='nowrap'>${value?.toFixed(3)} USD</Typography>
        </Box>
        <Box width='80px' textAlign='right'>
          <Typography variant="p" whiteSpace='nowrap'>${`${ildValue?.toFixed(3)}`}</Typography>
        </Box>
        <Box width='80px' textAlign='right'>
          <Typography variant="p" whiteSpace='nowrap'>${rewards?.toFixed(3)}</Typography>
        </Box>
        <Box display="flex" gap="10px">
          <PayIldButton onClick={showClosePositionDialog}></PayIldButton>
        </Box>
      </FormStack>
    </Box>
  )
}

const FormStack = styled(Stack)`
  display: flex;
  width: 100%;
  height: 63px;
  padding: 9px 20px;
  cursor: pointer;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  &:hover {
    background-color: ${(props) => props.theme.boxes.darkBlack};
  }
`
const TickerWrapper = styled(Box)`
  width: 100px;
  margin-left: 8px;
  text-align: left;
`

// const RecenterButton = styled(Button)`
// 	width: 76px;
//   height: 25px;
// 	padding: 3px 0 4px;
// 	border-radius: 10px;
// 	border: solid 1px #8c73ac;
// 	background-color: #000;
// 	font-size: 10px;
//   font-weight: 500;
// 	text-align: center;
//   color: #fff;
// 	margin-left: 23px;
// `

export default LiquidityPairView
