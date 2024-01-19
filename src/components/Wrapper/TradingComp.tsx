import { Box, Stack, Button, IconButton, Typography, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useState, useEffect } from 'react'
import PairInput from './PairInput'
import Image from 'next/image'
import oneWaySwapIcon from 'public/images/oneway-swap.svg'
import { useForm, Controller } from 'react-hook-form'
import { useWallet } from '@solana/wallet-adapter-react'
import { useTradingMutation } from '~/features/Wrapper/Trading.mutation'
import { useBalanceQuery } from '~/features/Wrapper/Balance.query'
import { useWrapperDetailQuery, PairData } from '~/features/Wrapper/MarketDetail.query'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { SubmitButton } from '../Common/CommonButtons'

interface Props {
  assetIndex: number
  onShowSearchAsset: () => void
}

const TradingComp: React.FC<Props> = ({ assetIndex, onShowSearchAsset }) => {
  const [loading, setLoading] = useState(false)
  const { publicKey } = useWallet()
  const { setOpen } = useWalletDialog()

  const fromPair: PairData = {
    tickerIcon: '/images/assets/on-arb.svg',
    tickerName: 'Wrap Arbitrum',
    tickerSymbol: 'dARB',
  }

  const { data: assetData } = useWrapperDetailQuery({
    index: assetIndex,
    refetchOnMount: true,
    enabled: true
  })

  const { data: myBalance, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    index: assetIndex,
    refetchOnMount: 'always',
    enabled: publicKey != null
  })

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      amountWrapAsset: NaN,
    }
  })

  const [amountWrapAsset] = watch([
    'amountWrapAsset'
  ])

  const initData = () => {
    setValue('amountWrapAsset', NaN)
    refetch()
  }

  useEffect(() => {
    if (assetIndex) {
      initData()
      trigger()
    }
  }, [assetIndex])

  const { mutateAsync } = useTradingMutation(publicKey)

  const calculateTotalAmountByFrom = (newValue: number) => {
    setValue('amountWrapAsset', newValue)
  }

  const onConfirm = async () => {
    try {
      setLoading(true)
      const data = await mutateAsync(
        {
          quantity: amountWrapAsset,
          poolIndex: assetIndex,
        }
      )

      if (data) {
        setLoading(false)
        console.log('data', data)
        initData()
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const invalidMsg = () => {
    if (amountWrapAsset == 0 || isNaN(amountWrapAsset) || !amountWrapAsset) {
      return 'Enter Amount'
    } else if (amountWrapAsset > myBalance?.underlyingAssetVal!) {
      return `Insufficient Amount`
    } else {
      return ''
    }
  }

  const isValid = invalidMsg() === ''

  return (
    <>
      <div style={{ width: '100%', height: '100%' }}>
        <Box p='18px' sx={{ paddingBottom: { xs: '150px', md: '18px' } }}>
          <Box>
            <Box>
              <Controller
                name="amountWrapAsset"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || isNaN(value) || value <= 0) {
                      return 'the amount should not empty'
                    } else if (value > myBalance?.underlyingAssetVal!) {
                      return 'The amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    title="You’re Wrapping"
                    tickerIcon={fromPair.tickerIcon}
                    ticker={fromPair.tickerSymbol}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const wrapAmt = parseFloat(event.currentTarget.value)
                      field.onChange(event.currentTarget.value)
                      calculateTotalAmountByFrom(wrapAmt)
                    }}
                    onMax={(balance: number) => {
                      field.onChange(balance)
                      calculateTotalAmountByFrom(balance)
                    }}
                    value={field.value}
                    dollarValue={field.value}
                    balance={myBalance?.underlyingAssetVal}
                    balanceDisabled={!publicKey}
                    tickerClickable={true}
                    onTickerClick={onShowSearchAsset}
                    max={myBalance?.underlyingAssetVal}
                  />
                )}
              />
            </Box>
          </Box>

          <Box height='100%'>
            <SwapButton>
              <Image src={oneWaySwapIcon} alt="swap" />
            </SwapButton>

            <PairInput
              title="To Receive"
              tickerIcon={assetData?.tickerIcon!}
              ticker={assetData?.tickerSymbol!}
              value={amountWrapAsset}
              balanceDisabled={true}
              valueDisabled={true}
              tickerClickable={false}
            />

            <Box my='5px'>
              {!publicKey ? <ConnectButton onClick={() => setOpen(true)}>
                <Typography variant='h4'>Connect Wallet</Typography>
              </ConnectButton> :
                // isValid ? 
                <SubmitButton onClick={handleSubmit(onConfirm)} disabled={loading} sx={loading ? { border: '1px solid #c4b5fd' } : {}}>
                  {!loading ?
                    <Typography variant='p_xlg'>Wrap</Typography>
                    :
                    <Stack direction='row' alignItems='center' gap={2}>
                      <CircularProgress sx={{ color: '#c4b5fd' }} size={15} thickness={4} />
                      <Typography variant='p_xlg' color='#fff'>Wrap</Typography>
                    </Stack>}
                </SubmitButton>
                // :
                //   <DisableButton disabled={true}>
                //     <Typography variant='p_xlg'>{invalidMsg()}</Typography>
                //   </DisableButton>
              }
            </Box>

          </Box>
        </Box>
      </div>
    </>
  )
}

const SwapButton = styled(IconButton)`
  width: 35px;
  height: 35px;
  margin-top: 13px;
  margin-bottom: 6px;
  padding: 8px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.05);
  &:hover {
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.25);
    // border: solid 1px ${(props) => props.theme.basis.melrose};
  }
`
const ConnectButton = styled(Button)`
  width: 100%;
  height: 52px;
  color: #fff;
  border: solid 1px rgba(65, 65, 102, 0.5);
  // background: ${(props) => props.theme.basis.royalPurple};
  border-radius: 10px;
  &:hover {
    // background: ${(props) => props.theme.basis.royalPurple};
    opacity: 0.6;
  }
`
const DisableButton = styled(Button)`
  width: 100%;
  height: 52px;
	color: #fff;
  border-radius: 10px;
	margin-bottom: 10px;
  &:disabled {
    border: solid 1px ${(props) => props.theme.basis.portGore};
    background: transparent;
    color: ${(props) => props.theme.basis.textRaven};
  } 
`

export default withSuspense(TradingComp, <Box mt='20px'><LoadingProgress /></Box>)
