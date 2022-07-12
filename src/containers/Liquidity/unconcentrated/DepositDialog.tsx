import React, { useState } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText } from '@mui/material'
import PairInput from '~/components/Liquidity/unconcent/PairInput'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import { useDepositMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import Image from 'next/image'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'

const DepositDialog = ({ assetId, pool, open, handleClose }: { assetId: string, pool: PoolList, open: any, handleClose: any }) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

	const unconcentratedIndex = parseInt(assetId)
  const { mutateAsync } = useDepositMutation(publicKey)

  const {
		handleSubmit,
    setValue,
		control,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      borrowFrom: 0.0,
      borrowTo: 0.0,
    }
	})
  const [borrowFrom, borrowTo] = watch([
		'borrowFrom',
		'borrowTo',
	])

  const { data: balances, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    index: unconcentratedIndex,
	  refetchOnMount: true,
    enabled: open && publicKey != null
	})

  const { data: unconcentData } = useUnconcentDetailQuery({
    userPubKey: publicKey,
    index: unconcentratedIndex,
	  refetchOnMount: true,
    enabled: open && publicKey != null
	})

	const onDeposit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        index: unconcentratedIndex,
        iassetAmount: borrowFrom
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to deposit')

            handleClose()
            refetch()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to deposit')
          setLoading(false)
        }
      }
    )
	}

  const isValid = Object.keys(errors).length === 0

	return unconcentData && balances ? (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px' }}>
          <Box sx={{ padding: '8px 28px', color: '#fff' }}>
            <WarningBox>
              Acquire addtional iAsset and USDi by <span style={{ textDecoration: 'underline' }}>borrowing</span> and <span style={{ textDecoration: 'underline' }}>swaping</span>, click <span style={{ textDecoration: 'underline' }}>here</span> to learn more.
            </WarningBox>
            <Box sx={{ marginTop: '20px'}}>
              <SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide additional <span style={{ color: '#809cff' }}>{unconcentData.tickerSymbol}</span> to deposit</Box></SubTitle>
              <Controller
                name="borrowFrom"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return 'the borrowing amount should be above zero.'
                    } else if (value > balances?.iassetVal) {
                      return 'The borrowing amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={unconcentData.tickerIcon}
                    tickerName={unconcentData.tickerName}
                    tickerSymbol={unconcentData.tickerSymbol}
                    value={parseFloat(field.value.toFixed(3))}
                    balance={balances?.iassetVal}
                    currentAmount={pool.liquidityAsset}
                    dollarPrice={pool.liquidityAsset * unconcentData.price}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(parseFloat(event.currentTarget.value))
                      setValue('borrowTo', parseFloat(event.currentTarget.value) * unconcentData.price);
                    }}
                    onMax={(balance: number) => {
                      field.onChange(balance)
                      setValue('borrowTo', balance * unconcentData.price);
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.borrowFrom?.message}>{errors.borrowFrom?.message}</FormHelperText>
            </Box>
            <StyledDivider />

            <Box>
              <SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide additional <span style={{ color: '#809cff' }}>USDi</span> to deposit</Box></SubTitle>
              
              <Controller
                name="borrowTo"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return 'the amount should be above zero.'
                    } else if (value > balances?.usdiVal) {
                      return 'The amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={'/images/assets/USDi.png'}
                    tickerName="USDi Coin"
                    tickerSymbol="USDi"
                    value={parseFloat(field.value.toFixed(3))}
                    balance={balances?.usdiVal}
                    currentAmount={pool.liquidityUSD}
                    dollarPrice={pool.liquidityUSD}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(parseFloat(event.currentTarget.value))
                      setValue('borrowFrom', parseFloat(event.currentTarget.value) / unconcentData.price);
                    }}
                    onMax={(balance: number) => {
                      field.onChange(balance)
                      setValue('borrowFrom', balance / unconcentData.price);
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.borrowTo?.message}>{errors.borrowTo?.message}</FormHelperText>
            </Box>
            <StyledDivider />
            <ActionButton onClick={handleSubmit(onDeposit)} disabled={!isDirty || !isValid}>Deposit</ActionButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
	) : <></>
}

const WarningBox = styled(Box)`
  max-width: 507px;
  height: 42px;
  font-size: 11px;
  font-weight: 500;
  line-height: 42px;
  color: #989898;
  border-radius: 10px;
  border: solid 1px #809cff;
  background-color: rgba(128, 156, 255, 0.09);
  text-align: center;
  margin: 0 auto;
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 20px;
	margin-top: 20px;
	height: 1px;
`

const SubTitle = styled('div')`
  display: flex;
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 7px;
	color: #fff;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default DepositDialog
