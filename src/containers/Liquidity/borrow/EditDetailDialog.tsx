import React, { useState } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText } from '@mui/material'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import PairInput from '~/components/Borrow/PairInput'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditMutation } from '~/features/Borrow/Borrow.mutation'
import {
	PairData
} from '~/features/MyLiquidity/BorrowPosition.query'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const EditDetailDialog = ({ borrowId, borrowDetail, open, onHideEditForm }: any) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const borrowIndex = parseInt(borrowId)
  const fromPair: PairData = {
		tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',
	}

  const { mutateAsync } = useEditMutation(publicKey)

  const {
		handleSubmit,
		control,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: 0.0,
      borrowAmount: 0.0,
    }
	})
  const [collAmount, borrowAmount] = watch([
		'collAmount',
		'borrowAmount',
	])

  // const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
	//   if (typeof newValue === 'number') {
	//     setCollRatio(newValue)
	//   }
	// }

	const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        borrowIndex,
        totalCollateralAmount: collAmount,
        totalBorrowAmount: borrowAmount
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to edit')
            setLoading(false)
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to edit')
          setLoading(false)
        }
      }
    )
	}

  const isValid = Object.keys(errors).length === 0

  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={onHideEditForm}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <Box sx={{ padding: '8px 1px', color: '#fff' }}>
          <Box>
              <SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Edit collateral amount</Box></SubTitle>
              <SubTitleComment>Editing collateral will effect the collateral ratio</SubTitleComment>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return 'the collateral amount should be above zero.'
                    } else if (value > borrowDetail?.usdiVal) {
                      return 'The collateral amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={fromPair.tickerIcon}
                    tickerName={fromPair.tickerName}
                    tickerSymbol={fromPair.tickerSymbol}
                    value={field.value}
                    balance={borrowDetail?.usdiVal}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(parseFloat(event.currentTarget.value))
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
            </Box>
            <StyledDivider />

            {/* <Box>
              <SubTitle>(2) Edit collateral ratio</SubTitle>
              <SubTitleComment>To avoid liquidation, collateral ratio above safe point is reccommended</SubTitleComment>
              <RatioSlider min={0} max={500} value={collRatio} onChange={handleChangeCollRatio} />
            </Box>
            <StyledDivider /> */}

            <Box>
              <SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Borrow Amount</Box></SubTitle>
              <SubTitleComment>
                The position can be closed when the full borrowed amount is repayed
              </SubTitleComment>
              <Box sx={{ marginTop: '20px' }}>
                <Controller
                  name="borrowAmount"
                  control={control}
                  rules={{
                    validate(value) {
                      if (!value || value <= 0) {
                        return 'the borrow amount should be above zero.'
                      } else if (value > borrowDetail?.iassetVal) {
                        return 'The borrow amount cannot exceed the balance.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      tickerIcon={
                        borrowDetail ? borrowDetail!.tickerIcon : '/images/assets/ethereum-eth-logo.svg'
                      }
                      tickerName={borrowDetail ? borrowDetail!.tickerName : ''}
                      tickerSymbol={borrowDetail ? borrowDetail!.tickerSymbol : ''}
                      balance={borrowDetail?.iassetVal}
                      value={field.value}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(parseFloat(event.currentTarget.value))
                      }}
                    />
                  )}
                />
                <FormHelperText error={!!errors.borrowAmount?.message}>{errors.borrowAmount?.message}</FormHelperText>
              </Box>

              {/* <PairInput
                tickerIcon={ethLogo}
                tickerName="Incept USD"
                tickerSymbol="USDi"
                value={borrowAmount}
                disabled
                balanceDisabled
              /> */}
            </Box>
            <StyledDivider />

            <ActionButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid}>Edit</ActionButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )  
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 20px;
	height: 1px;
`

const SubTitle = styled('div')`
  display: flex;
	font-size: 18px;
	font-weight: 500;
	margin-bottom: 17px;
	color: #fff;
`

const SubTitleComment = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	margin-bottom: 10px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
  &:disabled {
    background-color: #444;
    color: #adadad;
  } 
`

export default EditDetailDialog