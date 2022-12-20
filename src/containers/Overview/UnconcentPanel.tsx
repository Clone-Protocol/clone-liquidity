import { Box, Stack, Button, Divider, FormHelperText } from '@mui/material'
import React, { useState } from 'react'
import Link from 'next/link'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import WarningIcon from 'public/images/warning-icon.png'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLiquidityMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { Balance } from '~/features/Borrow/Balance.query'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const UnconcentPanel = ({ balances, assetData, assetIndex, onRefetchData } : { balances: Balance, assetData: PositionInfo, assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { mutateAsync: mutateAsyncLiquidity } = useLiquidityMutation(publicKey)

  const {
		handleSubmit,
    setValue,
		control,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      borrowFrom: NaN,
      borrowTo: NaN,
    }
	})
  const [borrowFrom, borrowTo] = watch([
		'borrowFrom',
		'borrowTo',
	])

  const initData = () => {
    setValue('borrowFrom', 0.0)
    setValue('borrowTo', 0.0)
    onRefetchData()
  }

	const onLiquidity = async () => {
    setLoading(true)
    await mutateAsyncLiquidity(
      {
        iassetIndex: assetIndex,
			  iassetAmount: borrowFrom,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully established unconcentrated liquidity position')
            setLoading(false)
            initData()
            router.push('/liquidity?ltab=1')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error establishing unconcentrated liquidity position')
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

      <Box>
        <PriceIndicatorBox
          tickerIcon={assetData.tickerIcon}
          tickerName={assetData.tickerName}
          tickerSymbol={assetData.tickerSymbol}
          value={assetData.price}
        />

        <Box sx={{ background: 'rgba(21, 22, 24, 0.75)', paddingX: '32px', paddingY: '24px', marginTop: '28px', borderRadius: '10px' }}>
          <Stack
            sx={{
              background: 'rgba(233, 209, 0, 0.04)',
              border: '1px solid #e9d100',
              borderRadius: '10px',
              color: '#9d9d9d',
              padding: '8px',
              marginTop: '10px',
              marginBottom: '30px',
            }}
            direction="row">
            <Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}>
              <Image src={WarningIcon} />
            </Box>
            <WarningBox>
              Unconcentrated liquidity positions are less capital efficent than coment liquidity. <br />
              Learn more <span style={{ textDecoration: 'underline' }}>here</span>.
            </WarningBox>
          </Stack>

          <Box>
            <SubTitle>
              <Image src={OneIcon} />{' '}
              <Box sx={{ marginLeft: '9px' }}> Provide {assetData.tickerSymbol}</Box>
            </SubTitle>
            <SubTitleComment>
              Acquire {assetData.tickerSymbol} by <Link href={`/borrow?lAssetId=${assetIndex}`}><span style={{ color: '#fff', cursor: 'pointer' }}>Borrowing</span></Link>
            </SubTitleComment>
            <Controller
              name="borrowFrom"
              control={control}
              rules={{
                validate(value) {
                  if (!value || value <= 0) {
                    return '' //'the borrowing amount should be above zero.'
                  } else if (value > balances?.iassetVal) {
                    return 'The borrowing amount cannot exceed the balance.'
                  }
                }
              }}
              render={({ field }) => (
                <PairInput
                  tickerIcon={assetData.tickerIcon}
                  tickerSymbol={assetData.tickerSymbol}
                  value={field.value}
                  headerTitle="Balance"
                  headerValue={balances?.iassetVal}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(parseFloat(event.currentTarget.value))
                    setValue('borrowTo', parseFloat(event.currentTarget.value) * assetData.price);
                  }}
                  onMax={(value: number) => {
                    field.onChange(value)
                    setValue('borrowTo', value * assetData.price);
                  }}
                />
              )}
            />
            <FormHelperText error={!!errors.borrowFrom?.message}>{errors.borrowFrom?.message}</FormHelperText>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>
              <Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}> Provide USDi</Box>
            </SubTitle>
            <SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
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
                  tickerSymbol="USDi"
                  value={field.value}
                  headerTitle="Balance"
                  headerValue={balances?.usdiVal}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(parseFloat(event.currentTarget.value))
                    setValue('borrowFrom', parseFloat(event.currentTarget.value) / assetData.price);
                  }}
                  onMax={(value: number) => {
                    field.onChange(value)
                    setValue('borrowFrom', value / assetData.price);
                  }}
                />
              )}
            />
            <FormHelperText error={!!errors.borrowTo?.message}>{errors.borrowTo?.message}</FormHelperText>
          </Box>
          <StyledDivider />

          <LiquidityButton onClick={handleSubmit(onLiquidity)} disabled={!isDirty || !isValid}>Create Unconcentrated Liquidity Position</LiquidityButton>
        </Box>
      </Box>
    </>
  )
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`

const SubTitle = styled(Box)`
	display: flex;
	font-size: 14px;
	font-weight: 500;
`

const SubTitleComment = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
	margin-top: 10px;
`

const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

const LiquidityButton = styled(Button)`
	width: 100%;
  background-color: #4e609f;
	color: #fff;
  font-size: 13px;
	border-radius: 10px;
	margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  } 
`

export default withSuspense(UnconcentPanel, <LoadingProgress />)