import { Box, Stack, Typography } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI } from '~/features/MyLiquidity/BorrowPosition.query'
import Image from 'next/image'
import EditIcon from 'public/images/edit-icon.svg'
import CollRatioBar from './CollRatioBar'
import { useState } from 'react'
import { RISK_RATIO_VAL } from '~/data/riskfactors'

interface Props {
  positionInfo: PI
  onShowEditForm: () => void
  onShowBorrowMore: () => void
}

const PositionInfo: React.FC<Props> = ({ positionInfo, onShowEditForm, onShowBorrowMore }) => {
  const [isEditCollHover, setIsEditCollHover] = useState(false)
  const [isEditBorrowHover, setIsEditBorrowHover] = useState(false)
  const hasRiskRatio = positionInfo.collateralRatio - positionInfo.minCollateralRatio <= RISK_RATIO_VAL

  const borrowedDollarPrice = Number(positionInfo.borrowedOnasset) * positionInfo.price

  return positionInfo ? (
    <BoxWithBorder>
      <Stack direction='row' gap={3}>
        <ValueBox width='220px'>
          <Box mb='6px'><Typography variant='p'>Borrowed Asset</Typography></Box>
          <Box display="flex" alignItems='center'>
            <Image src={positionInfo.tickerIcon} width={28} height={28} alt={positionInfo.tickerSymbol!} />
            <Typography variant="h4" ml='10px'>
              {positionInfo.tickerName}
            </Typography>
          </Box>
        </ValueBox>
        <ValueBox width='300px'>
          <Box mb='6px'><Typography variant='p'>Collateral Ratio</Typography></Box>
          <Stack direction='row' gap={1} alignItems='center'>
            <Typography variant='h4'>{positionInfo.collateralRatio.toFixed(2)}%</Typography>
            <Typography variant='p_lg' color='#66707e'>(min {positionInfo.minCollateralRatio}%)</Typography>
          </Stack>
        </ValueBox>
      </Stack>

      <Box my='15px'><Typography variant='p_lg'>Borrowed Amount</Typography></Box>
      <EditRowBox sx={isEditBorrowHover ? { background: '#1b1b1b' } : {}}>
        <EditBox onClick={onShowBorrowMore} onMouseOver={() => setIsEditBorrowHover(true)} onMouseLeave={() => setIsEditBorrowHover(false)}>
          <Image src={EditIcon} alt='edit' />
        </EditBox>
        <Stack width='100%' direction='row' justifyContent='space-between' alignItems='center' padding='27px'>
          <Box textAlign='left'>
            <Box><Typography fontSize='26px'>{positionInfo.borrowedOnasset.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography></Box>
            <Box><Typography variant='p' color='#66707e'>${borrowedDollarPrice.toLocaleString()}</Typography></Box>
          </Box>
          <Box display="flex" alignItems='center'>
            <Image src={positionInfo.tickerIcon} width={22} height={22} alt={positionInfo.tickerSymbol!} />
            <Typography variant="h4" ml='3px'>
              {positionInfo.tickerName}
            </Typography>
          </Box>
        </Stack>
      </EditRowBox>

      <Box my='15px'><Typography variant='p_lg'>Collateral Amount</Typography></Box>
      <EditRowBox sx={isEditCollHover ? { background: '#1b1b1b' } : {}}>
        <EditBox onClick={onShowEditForm} onMouseOver={() => setIsEditCollHover(true)} onMouseLeave={() => setIsEditCollHover(false)}>
          <Image src={EditIcon} alt='edit' />
        </EditBox>
        <Stack width='100%' direction='row' justifyContent='space-between' alignItems='center' padding='27px'>
          <Box textAlign='left'>
            <Box><Typography fontSize='26px'>{positionInfo.collateralAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography></Box>
            <Box><Typography variant='p' color='#66707e'>${positionInfo.collateralAmount.toLocaleString()}</Typography></Box>
          </Box>
          <Box display="flex" alignItems='center'>
            <Image src={'/images/assets/on-usd.svg'} width={22} height={22} alt={'dev-usd'} />
            <Typography variant="h4" ml='3px'>
              devUSD
            </Typography>
          </Box>
        </Stack>
      </EditRowBox>
    </BoxWithBorder>
  ) : (
    <></>
  )
}

const ValueBox = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 78px;
  padding: 8px 30px;
  border-radius: 10px;
  line-height: 24px;
  background-color: ${(props) => props.theme.basis.jurassicGrey};
`
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
  padding: 24px;
`
const EditRowBox = styled(Box)`
  display: flex; 
  width: 100%;
  height: 80px; 
  margin-bottom: 9px;
  border: 1px solid ${(props) => props.theme.basis.shadowGloom};
`
const EditBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  cursor: pointer;
  border-right: 1px solid ${(props) => props.theme.boxes.greyShade};
`

export default withCsrOnly(PositionInfo)
