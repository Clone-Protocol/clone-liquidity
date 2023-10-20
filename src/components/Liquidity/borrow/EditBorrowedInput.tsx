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
  onChangeType: (event: React.SyntheticEvent, newValue: number) => void
  onChangeAmount?: (e: React.FormEvent<HTMLInputElement>) => void
  onMax: (value: number) => void
}

const EditBorrowedInput: React.FC<Props> = ({
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
  const afterBorrowedAmount = isNaN(collAmount) ? Number(currentCollAmount) : editType === 0 ? Number(currentCollAmount) + Number(collAmount) : Number(currentCollAmount) - Number(collAmount)
  const afterBorrowedDollarPrice = isNaN(collAmountDollarPrice) ? Number(dollarPrice) : editType === 0 ? Number(dollarPrice) + Number(collAmountDollarPrice) : Number(dollarPrice) - Number(collAmountDollarPrice)
  const isAfterNoBorrowedRemaining = afterBorrowedAmount <= 0

  return (
    <FormControl variant="standard" sx={{ width: "100%" }}>
      <Box sx={{ backgroundColor: '#1a1c28' }}>
        <StyledTabs value={editType} onChange={onChangeType}>
          <StyledTab value={0} label="Borrow More" width='142px' allBorderRadius={true}></StyledTab>
          <StyledTab value={1} label="Repay" allBorderRadius={true}></StyledTab>
        </StyledTabs>
      </Box>

      <StackWithBorder direction='row' justifyContent="space-between" alignItems='center' mt='38px'>
        <Typography variant="p">Current borrowed amount</Typography>
        <Stack direction='row' gap={1}>
          <Typography variant="p_lg">{currentCollAmount?.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</Typography>
          <Typography variant="p_lg" color='#66707e'>(${dollarPrice?.toLocaleString(undefined, { maximumFractionDigits: 5 })} USD)</Typography>
        </Stack>
      </StackWithBorder>

      {/* <Stack height="40px" direction="row" justifyContent="space-between">
        <HeaderTitle>
          {editType === 0 ? (
            <span>
              <Typography variant="p">Max Borrow-able: </Typography>
              <MaxPointerValue onClick={() => onMax(maxCollVal)}>
                {maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })}
              </MaxPointerValue>
            </span>
          ) : (
            <span>
              <Typography variant="p">Wallet Balance: </Typography>
              <Typography variant="p">
                {maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })}
              </Typography>
            </span>
          )}
        </HeaderTitle>
      </Stack> */}
      <CenterBox mt='15px'>
        <PairInput
          tickerIcon={tickerIcon}
          tickerSymbol={tickerSymbol}
          rightHeaderTitle={editType === 0 ? 'Max Borrowable' : 'Wallet Balance'}
          inputTitle={editType === 0 ? 'Borrow More' : 'Repay'}
          inputTitleColor="#fff"
          value={collAmount}
          valueDollarPrice={collAmountDollarPrice}
          balance={maxCollVal}
          hideMaxButton={editType === 0}
          onChange={onChangeAmount}
          onMax={onMax}
        />

        <StackWithBorder direction='row' justifyContent="space-between" alignItems='center' sx={{ background: 'transparent' }}>
          <Typography variant="p">Borrow amount after {editType === 0 ? "borrowing" : "repaying"}</Typography>
          <Stack direction='row' gap={1}>
            <Typography variant="p_lg">{`${isAfterNoBorrowedRemaining ? '0' : afterBorrowedAmount.toLocaleString(undefined, { maximumFractionDigits: 5 }) + " " + tickerSymbol}`}</Typography>
            <Typography variant="p_lg" color='#66707e'>{`${isAfterNoBorrowedRemaining ? '(Paid in Full)' : '$' + afterBorrowedDollarPrice.toLocaleString(undefined, { maximumFractionDigits: 5 })}`}</Typography>
          </Stack>
        </StackWithBorder>

        {/* <FormStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width={28} height={28} alt={tickerSymbol!} />
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
        </FormStack> */}
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

export default EditBorrowedInput
