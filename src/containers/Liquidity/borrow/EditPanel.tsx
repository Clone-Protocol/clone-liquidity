import React, { useState } from 'react'
import { Grid, Box, Divider, Button, FormHelperText } from '@mui/material'
import { styled } from '@mui/system'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import PairInput from '~/components/Borrow/PairInput'
import Image from 'next/image'
// import SelectPairInput from '~/components/Borrow/SelectPairInput'
import { useEditMutation } from '~/features/Borrow/Borrow.mutation'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
// import RatioSlider from '~/components/Borrow/RatioSlider'
import {
	PairData,
  useBorrowPositionQuery
} from '~/features/MyLiquidity/BorrowPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const EditPanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
	const fromPair: PairData = {
		tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',
	}

	// const [collRatio, setCollRatio] = useState(150)
	const borrowIndex = parseInt(assetId)
  const { mutateAsync } = useEditMutation(publicKey)

  const { data: positionInfo } = useBorrowPositionQuery({ 
    userPubKey: publicKey, 
    index: borrowIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  });

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

	return positionInfo ? (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PositionInfo positionInfo={positionInfo} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ padding: '30px', color: '#fff' }}>
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
                    } else if (value > positionInfo?.usdiVal) {
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
                    balance={positionInfo?.usdiVal}
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
                      } else if (value > positionInfo?.iassetVal) {
                        return 'The borrow amount cannot exceed the balance.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      tickerIcon={
                        positionInfo ? positionInfo!.tickerIcon : '/images/assets/ethereum-eth-logo.svg'
                      }
                      tickerName={positionInfo ? positionInfo!.tickerName : ''}
                      tickerSymbol={positionInfo ? positionInfo!.tickerSymbol : ''}
                      balance={positionInfo?.iassetVal}
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
        </Grid>
      </Grid>
    </>
	) : <></>
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

export default withSuspense(EditPanel, <LoadingProgress />)
