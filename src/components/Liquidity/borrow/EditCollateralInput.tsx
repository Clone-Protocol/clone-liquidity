import { FormControl, styled, Stack, Box, Typography } from "@mui/material"
import Image from "next/image"
import { StyledTabs, StyledTab } from "~/components/Common/StyledTab"

interface Props {
  editType: number
  tickerIcon: string
  tickerName?: string | null
  tickerSymbol: string | null
  maxCollVal: number
  collAmount: number
  collAmountDollarPrice?: number
  currentCollAmount?: number
  dollarPrice?: number
  onChangeType: (event: React.SyntheticEvent, newValue: number) => void
  onChangeAmount?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onMax: (value: number) => void
}

const EditCollateralInput: React.FC<Props> = ({
  editType,
  tickerIcon,
  tickerSymbol,
  maxCollVal,
  collAmount,
  collAmountDollarPrice,
  currentCollAmount,
  dollarPrice,
  onChangeType,
  onChangeAmount,
  onMax,
}) => {
  return (
    <FormControl variant="standard" sx={{ width: "100%" }}>
      <Stack height="40px" direction="row" justifyContent="space-between">
        <StyledTabs value={editType} onChange={onChangeType}>
          <StyledTab value={0} label="Deposit"></StyledTab>
          <StyledTab value={1} label="Withdraw"></StyledTab>
        </StyledTabs>
        <HeaderTitle>
          {editType === 0 ? "Balance" : "Max Withdraw-able"} :{" "}
          <MaxPointerValue onClick={() => onMax(maxCollVal)}>
            {maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}
          </MaxPointerValue>
        </HeaderTitle>
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
              min={0}
              max={maxCollVal}
              sx={collAmount && collAmount > 0 ? { color: "#fff" } : { color: "#adadad" }}
              placeholder="0.00"
              value={collAmount}
              onChange={onChangeAmount}
            />
            <DollarAmount>
              {collAmountDollarPrice && collAmountDollarPrice > 0
                ? "$" + collAmountDollarPrice?.toLocaleString() + " USD"
                : ""}
            </DollarAmount>
          </Box>
        </FormStack>
      </CenterBox>
      <BottomBox>
        <Typography variant="p" color="#989898">
          Current Collateral:{" "}
        </Typography>{" "}
        <Typography variant="p">
          {currentCollAmount?.toLocaleString()} {tickerSymbol}{" "}
          {dollarPrice && "($" + dollarPrice.toLocaleString() + ")"}
        </Typography>
      </BottomBox>
    </FormControl>
  )
}

const FormStack = styled(Stack)`
  display: flex;
  width: 100%;
  height: 54px;
  padding: 8px 15px;
  border-bottom: solid 1px #444444;
  background-color: #333333;
  &:hover {
    box-shadow: 0 0 0 1px ${(props) => props.theme.palette.text.secondary} inset;
  }
`
const HeaderTitle = styled(Box)`
  display: flex;
  align-items: flex-end;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
`
const MaxPointerValue = styled("span")`
  color: #90e4fe;
  margin-left: 4px;
  cursor: pointer;
`
const CenterBox = styled(Box)`
  background-color: ${(props) => props.theme.boxes.blackShade};
`
const InputAmount = styled(`input`)`
  width: 230px;
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

export default EditCollateralInput
