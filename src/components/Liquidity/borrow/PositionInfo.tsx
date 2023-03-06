import { Box, Stack, Typography } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI } from '~/features/MyLiquidity/BorrowPosition.query'
import Image from 'next/image'
import EditIcon from 'public/images/edit-icon.svg'
import CollRatioBar from './CollRatioBar'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { useState } from 'react'

interface Props {
  positionInfo: PI
  onShowEditForm: () => void
  onShowBorrowMore: () => void
}

const RISK_RATIO_VAL = 25

const PositionInfo: React.FC<Props> = ({ positionInfo, onShowEditForm, onShowBorrowMore }) => {
  const [isEditCollHover, setIsEditCollHover] = useState(false)
  const [isEditBorrowHover, setIsEditBorrowHover] = useState(false)
  const hasRiskRatio = positionInfo.collateralRatio - positionInfo.minCollateralRatio <= RISK_RATIO_VAL

  const borrowedDollarPrice = positionInfo.borrowedIasset * positionInfo.price

  return positionInfo ? (
    <Box mt='21px'>
      <BoxWithBorder mb='15px'>
        <Box><Typography variant='p_lg' color='#989898'>Collateral Ratio</Typography></Box>
        {positionInfo.borrowedIasset > 0 ?
          <CollRatioBar hasRiskRatio={hasRiskRatio} minRatio={positionInfo.minCollateralRatio} ratio={positionInfo.collateralRatio} />
          :
          <Box>-</Box>
        }
      </BoxWithBorder>

      <EditRowBox sx={isEditCollHover ? { background: '#1b1b1b' } : {}}>
        <EditBox onClick={onShowEditForm} onMouseOver={() => setIsEditCollHover(true)} onMouseLeave={() => setIsEditCollHover(false)}>
          <Image src={EditIcon} />
        </EditBox>
        <Stack width='100%' direction='row' justifyContent='space-between' alignItems='center' padding='27px'>
          <Typography variant='p_lg' color='#989898'>Collateral</Typography>
          <Box lineHeight='18px' textAlign='right'>
            <Box><Typography variant='p_xlg'>{positionInfo.collateralAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} USDi</Typography></Box>
            <Box><Typography variant='p' color='#989898'>${positionInfo.collateralAmount.toLocaleString()} USD</Typography></Box>
          </Box>
        </Stack>
      </EditRowBox>

      <EditRowBox sx={isEditBorrowHover ? { background: '#1b1b1b' } : {}}>
        <EditBox onClick={onShowBorrowMore} onMouseOver={() => setIsEditBorrowHover(true)} onMouseLeave={() => setIsEditBorrowHover(false)}>
          <Image src={EditIcon} />
        </EditBox>
        <Stack width='100%' direction='row' justifyContent='space-between' alignItems='center' padding='27px'>
          <Typography variant='p_lg' color='#989898'>Borrowed</Typography>
          <Box lineHeight='18px' textAlign='right'>
            <Box><Typography variant='p_xlg'>{positionInfo.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {positionInfo.tickerSymbol}</Typography></Box>
            <Box><Typography variant='p' color='#989898'>${borrowedDollarPrice.toLocaleString()} USD</Typography></Box>
          </Box>
        </Stack>
      </EditRowBox>

      <Box display='flex' justifyContent='center'>
        <DataLoadingIndicator />
      </Box>
    </Box >
  ) : (
    <></>
  )
}

const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  padding: 20px;
`
const EditRowBox = styled(Box)`
  display: flex; 
  width: 100%;
  height: 70px; 
  margin-bottom: 9px;
  border: 1px solid ${(props) => props.theme.boxes.greyShade};
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
