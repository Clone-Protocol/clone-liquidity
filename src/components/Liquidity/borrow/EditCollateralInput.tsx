import { FormControl, styled, Stack, Box, Typography } from "@mui/material"
import { StyledTabs, StyledTab } from "~/components/Common/StyledTab"
import PairInput from '~/components/Liquidity/comet/PairInput'

interface Props {
  editType: number
  tickerIcon: string
  tickerName?: string | null
  tickerSymbol: string | null
  maxCollVal: number
  collAmount: number
  collAmountDollarPrice: number
  currentCollAmount: number
  dollarPrice: number
  hasInvalidRatio: boolean
  isFullRepaid: boolean
  onChangeType: (event: React.SyntheticEvent, newValue: number) => void
  onChangeAmount?: (e: React.FormEvent<HTMLInputElement>) => void
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
  hasInvalidRatio,
  isFullRepaid,
  onChangeType,
  onChangeAmount,
  onMax,
}) => {
  const afterCollateralAmount = isNaN(collAmount) ? Number(currentCollAmount) : editType === 0 ? Number(currentCollAmount) + Number(collAmount) : Number(currentCollAmount) - Number(collAmount)
  const afterCollateralDollarPrice = isNaN(collAmountDollarPrice) ? Number(dollarPrice) : (editType === 0 ? Number(dollarPrice) + Number(collAmountDollarPrice) : Number(dollarPrice) - Number(collAmountDollarPrice))
  const isAfterNoCollateralRemaining = afterCollateralAmount <= 0

  return (
    <FormControl variant="standard" sx={{ width: "100%" }}>
      <Box sx={{ backgroundColor: '#1a1c28' }}>
        <StyledTabs value={editType} onChange={onChangeType}>
          {!isFullRepaid && <StyledTab value={0} label="Deposit Collateral" width='176px' allBorderRadius={true}></StyledTab>}
          <StyledTab value={1} label="Withdraw Collateral" width='176px' allBorderRadius={true}></StyledTab>
        </StyledTabs>
      </Box>
      <StackWithBorder direction='row' justifyContent="space-between" alignItems='center' mt='38px'>
        <Typography variant="p">Current collateral amount</Typography>
        <Stack direction='row' gap={1}>
          <Typography variant="p_lg">{currentCollAmount?.toLocaleString()} devUSD</Typography>
          <Typography variant="p_lg" color='#66707e'>(${dollarPrice?.toLocaleString()} USD)</Typography>
        </Stack>
      </StackWithBorder>

      {/* <Stack height="40px" direction="row" justifyContent="space-between">
        <HeaderTitle>
          {editType === 0 ? "Balance" : "Max Withdraw-able"} :{" "}
          <MaxPointerValue onClick={() => onMax(maxCollVal)}>
            {maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}
          </MaxPointerValue>
        </HeaderTitle>
      </Stack> */}
      <CenterBox mt='15px'>
        <PairInput
          tickerIcon={tickerIcon}
          tickerSymbol={tickerSymbol}
          rightHeaderTitle={editType === 0 ? 'Wallet Balance' : 'Max Withdrawable Amount'}
          inputTitle={editType === 0 ? 'Deposit more collateral' : 'Withdraw Collateral'}
          inputTitleColor="#fff"
          value={collAmount}
          valueDollarPrice={collAmountDollarPrice}
          balance={maxCollVal}
          onChange={onChangeAmount}
          onMax={onMax}
        />

        <StackWithBorder direction='row' justifyContent="space-between" alignItems='center' sx={{ background: 'transparent' }}>
          <Typography variant="p">Collateral amount after {editType === 0 ? "deposit" : "withdrawal"}</Typography>
          <Stack direction='row' gap={1}>
            <Typography variant="p_lg">{isAfterNoCollateralRemaining ? '0' : hasInvalidRatio ? 'N/A' : `${afterCollateralAmount.toLocaleString()} devUSD`}</Typography>
            <Typography variant="p_lg" color='#66707e'>{isAfterNoCollateralRemaining ? '(No Collateral Remaining)' : hasInvalidRatio ? 'N/A' : `($${afterCollateralDollarPrice.toLocaleString()})`}</Typography>
          </Stack>
        </StackWithBorder>
      </CenterBox>
    </FormControl>
  )
}

const StackWithBorder = styled(Stack)`
  background: ${(props) => props.theme.basis.darkNavy};
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
  padding: 15px 18px;
  margin-top: 16px;
`
const CenterBox = styled(Box)`
  padding: 20px 17px;
  border-radius: 5px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`

export default EditCollateralInput
