import { FormControl, styled, Stack, Box, Typography, Button } from "@mui/material"
import Image from "next/image"

interface Props {
  tickerIcon: string
  tickerSymbol: string | null
  value?: number
  valueDollarPrice?: number
  rightHeaderTitle: string
  balance?: number
  inputTitle?: string
  inputTitleColor?: string
  balanceDisabled?: boolean
  hideMaxButton?: boolean
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
  inputTitleColor = '#66707e',
  balanceDisabled = false,
  hideMaxButton = false,
  onChange,
  onMax,
}) => {
  return (
    <FormControl variant="standard" sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography variant="p" color={inputTitleColor}>{inputTitle}</Typography>
        </Box>
        {!balanceDisabled ? (
          <Box display='flex' alignItems='center'>
            <Typography variant="p" color="#66707e">
              {rightHeaderTitle}:{" "}
            </Typography>
            <MaxPointerValue>
              <Typography variant="p">
                {balance?.toLocaleString(undefined, { maximumFractionDigits: 5 })}
              </Typography>
              {!hideMaxButton && <MaxButton onClick={() => onMax && onMax(balance!)}>MAX</MaxButton>}
            </MaxPointerValue>
          </Box>
        ) : (
          <></>
        )}
      </Stack>
      <CenterBox>
        <FormStack direction="row" justifyContent="space-between" alignItems="center">
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
                ? "$" + valueDollarPrice?.toLocaleString()
                : ""}
            </DollarAmount>
          </Box>
          <TickerBox display="flex" alignItems='center'>
            <Image src={tickerIcon} width={22} height={22} alt={tickerSymbol!} />
            <Box ml='4px'>
              <Typography variant="h4">{tickerSymbol}</Typography>
            </Box>
          </TickerBox>
        </FormStack>
      </CenterBox>
    </FormControl>
  )
}

const CenterBox = styled(Box)`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
`
const FormStack = styled(Stack)`
  display: flex;
  width: 100%;
  height: 84px;
  padding: 18px 12px;
  &:hover {
    box-shadow: 0 0 0 1px ${(props) => props.theme.basis.shadowGloom} inset;
  }
`
const MaxPointerValue = styled(Box)`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.basis.liquidityBlue};
  margin-left: 4px;
`
const MaxButton = styled(Box)`
  border-radius: 4px;
  background-color: ${(props) => props.theme.basis.jurassicGrey};
  margin-left: 6px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  color: #fff;
  cursor: pointer;
`
const InputAmount = styled(`input`)`
  width: 200px;
  border: 0px;
  background-color: transparent;
  font-size: 26px;
  color: #fff;
  &::placeholder {
    color: ${(props) => props.theme.basis.slug};
  }
`
const DollarAmount = styled("div")`
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.theme.basis.slug};
  margin-left: 2px;
`
const TickerBox = styled(Box)`
  background-color: ${(props) => props.theme.basis.darkNavy};
  border-radius: 10px;
  padding: 3px 10px 3px 5px;
`

export default PairInput
