import { FormControl, styled, Stack, Box, Typography } from "@mui/material"
import Image from "next/image"

interface Props {
  tickerIcon: string
  tickerSymbol: string | null
  value?: number
  valueDollarPrice?: number
  rightHeaderTitle: string
  balance?: number
  inputTitle?: string
  currentAmount?: number
  dollarPrice?: number
  maxDisabled?: boolean
  balanceDisabled?: boolean
  hideBottomBox?: boolean
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  onMax?: (value: number) => void
}

const PairInput: React.FC<Props> = ({
  tickerIcon,
  tickerSymbol,
  value,
  valueDollarPrice,
  rightHeaderTitle,
  balance,
  inputTitle,
  currentAmount,
  dollarPrice,
  maxDisabled = false,
  balanceDisabled = false,
  hideBottomBox = false,
  onChange,
  onMax,
}) => {
  return (
    <FormControl variant="standard" sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography variant="h8">{inputTitle}</Typography>
        </Box>
        {!balanceDisabled ? (
          <Box>
            <Typography variant="p" color="#989898">
              {rightHeaderTitle}:{" "}
            </Typography>
            {!maxDisabled ?
              <MaxPointerValue onClick={() => onMax && onMax(balance!)}>
                <Typography variant="p">
                  {balance?.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                </Typography>
              </MaxPointerValue>
              : <Typography variant="p">{balance?.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
            }
          </Box>
        ) : (
          <></>
        )}
      </Stack>
      <CenterBox>
        <FormStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width="28px" height="28px" />
            <Box ml="10px">
              <Typography variant="p_lg">{tickerSymbol}</Typography>
            </Box>
          </Box>
          <Box>
            <InputAmount
              id="ip-amount"
              type="number"
              placeholder="0.00"
              value={value}
              onChange={onChange}
              min={0}
              max={!balanceDisabled ? balance : 1000}
            />
            <DollarAmount>
              {valueDollarPrice && valueDollarPrice > 0
                ? "$" + valueDollarPrice?.toLocaleString() + " USD"
                : ""}
            </DollarAmount>
          </Box>
        </FormStack>
      </CenterBox>
      {!hideBottomBox && (
        <BottomBox>
          <Typography variant="p" color="#989898">
            Current Collateral:{" "}
          </Typography>
          <Typography variant="p">
            {currentAmount?.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}
          </Typography>
          <Typography variant="p" ml="3px">
            {dollarPrice && "($" + dollarPrice.toLocaleString() + ")"}
          </Typography>
        </BottomBox>
      )}
    </FormControl>
  )
}

const FormStack = styled(Stack)`
  display: flex;
  width: 100%;
  height: 54px;
  padding: 18px 12px;
  &:hover {
    box-shadow: 0 0 0 1px ${(props) => props.theme.palette.text.secondary} inset;
  }
`
const CenterBox = styled(Box)`
  background-color: ${(props) => props.theme.boxes.blackShade};
`
const MaxPointerValue = styled("span")`
  color: #90e4fe;
  cursor: pointer;
`
const InputAmount = styled(`input`)`
  width: 330px;
  margin-left: 30px;
  text-align: right;
  border: 0px;
  background-color: transparent;
  font-size: 17.3px;
  font-weight: 500;
  color: #fff;
`
const DollarAmount = styled("div")`
  font-size: 12px;
  font-weight: 500;
  text-align: right;
  color: ${(props) => props.theme.palette.text.secondary};
  margin-right: 2px;
`
const BottomBox = styled(Box)`
  text-align: center;
  height: 30px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default PairInput
