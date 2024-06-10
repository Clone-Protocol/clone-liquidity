import { Box, Stack, Button, IconButton, Typography, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useState, useEffect } from 'react'
import PairInput from './PairInput'
import Image from 'next/image'
import oneWaySwapIcon from 'public/images/oneway-swap.svg'
import walletIcon from 'public/images/wallet-icon-small.svg'
import { useForm, Controller } from 'react-hook-form'
import { useWallet } from '@solana/wallet-adapter-react'
import { useTradingMutation } from '~/features/Wrapper/Trading.mutation'
import { useBalanceQuery } from '~/features/Wrapper/Balance.query'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { SubmitButton } from '../Common/CommonButtons'
import { AssetTickers, assetMapping } from '~/data/assets'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'
import { shortenAddress } from '~/utils/address'

interface Props {
  assetIndex: number
  onShowSearchAsset: () => void
  onShowWrapBridge: () => void
}

const TradingComp1M: React.FC<Props> = ({ assetIndex, onShowSearchAsset, onShowWrapBridge }) => {
  const [loading, setLoading] = useState(false)
  const { publicKey } = useWallet()
  const [isWrap, setIsWrap] = useState(true)
  const { setOpen } = useWalletDialog()
  const [connected, setConnected] = useState(false)

  const pairData = assetMapping(assetIndex)

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
      amountUnwrapAsset: NaN
    }
  })

  const handleWalletClick = () => {
    //@TODO: wallet connect with EVM wallet
  }

  const [amountWrapAsset, amountUnwrapAsset] = watch([
    'amountWrapAsset',
    'amountUnwrapAsset'
  ])

  const initData = () => {
    setValue('amountWrapAsset', NaN)
    setValue('amountUnwrapAsset', NaN)
    refetch()
  }

  const handleChangeWrapType = () => {
    setIsWrap(!isWrap)
    initData()
    refetch()
    trigger()
  }

  useEffect(() => {
    if (assetIndex) {
      initData()
      trigger()
    }
  }, [assetIndex])

  const { mutateAsync } = useTradingMutation(publicKey)

  const calculateTotalAmountByFrom = (newValue: number) => {
    if (isWrap) {
      setValue('amountWrapAsset', newValue)
    } else {
      setValue('amountUnwrapAsset', newValue)
    }
  }

  const onConfirm = async () => {
    try {
      setLoading(true)
      const data = await mutateAsync(
        {
          quantity: isWrap ? amountWrapAsset : amountUnwrapAsset,
          isWrap,
          poolIndex: assetIndex,
        }
      )

      if (data) {
        setLoading(false)
        console.log('data', data)
        initData()
        refetch()
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const invalidMsg = () => {
    if (isWrap && (amountWrapAsset == 0 || isNaN(amountWrapAsset) || !amountWrapAsset)) {
      return 'Enter Amount'
    } else if (!isWrap && (amountUnwrapAsset == 0 || isNaN(amountUnwrapAsset) || !amountUnwrapAsset)) {
      return 'Enter Amount'
    } else if (isWrap && amountWrapAsset > myBalance?.underlyingAssetVal!) {
      return `Insufficient ${pairData.wrapTickerSymbol}`
    } else if (!isWrap && amountUnwrapAsset > myBalance?.onassetVal!) {
      return `Insufficient ${pairData.tickerSymbol}`
    } else if (!isWrap && amountUnwrapAsset > myBalance?.maxUnwrappableVal!) {
      return 'Exceeded Max Unwrap Amount'
    } else {
      return ''
    }
  }

  const isValid = invalidMsg() === ''

  return (
    <>
      <div style={{ width: '100%', height: '100%' }}>
        <Box sx={{ paddingBottom: { xs: '150px', md: '18px' } }}>
          <Box>
            {isWrap ?
              <Box>
                <Box display='flex' justifyContent='flex-start'>
                  <Box><Typography variant='p_lg' color='#66707e'>Token</Typography></Box>
                </Box>
                <SelectPoolBox onClick={publicKey ? () => onShowSearchAsset() : () => setOpen(true)}>
                  <Stack direction='row' gap={1}>
                    <Image src={pairData.tickerIcon} width={27} height={27} alt={pairData.tickerSymbol} />
                    <Typography variant='p_xlg'>{pairData.tickerSymbol}</Typography>
                  </Stack>
                  <Image src={SelectArrowIcon} alt='select' />
                </SelectPoolBox>

                <Box display='flex' justifyContent='flex-start'>
                  <Box><Typography variant='p_lg' color='#66707e'>Connect Wallet</Typography></Box>
                </Box>
                <Stack direction='row' alignItems='center' gap='10px'>
                  <Box>
                    {
                      !connected ?
                        <ConnectButton
                          onClick={handleWalletClick}
                        >
                          <Typography variant='p_lg'>Connect Wallet</Typography>
                        </ConnectButton>
                        :
                        <ConnectedButton onClick={handleWalletClick} startIcon={publicKey ? <Image src={walletIcon} alt="wallet" /> : <></>}>
                          <Typography variant='p'>{publicKey && shortenAddress(publicKey.toString())}</Typography>
                        </ConnectedButton>
                    }
                    {/* <WalletSelectBox show={showWalletSelectPopup} onHide={() => setShowWalletSelectPopup(false)} /> */}
                  </Box>
                  <NetworkBox><Typography variant='p'>Arbitrum Network</Typography></NetworkBox>
                </Stack>

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
                      tickerIcon={pairData.tickerIcon}
                      ticker={pairData.wrapTickerSymbol}
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
                      balance={myBalance?.underlyingAssetVal}
                      balanceDisabled={!publicKey}
                      tickerClickable={false}
                      max={myBalance?.underlyingAssetVal}
                    />
                  )}
                />
              </Box>
              :
              <Box>
                <MaxStack direction="row" justifyContent="space-between" alignItems="center" px='20px'>
                  <Typography variant='p_lg' color='#66707e'>Max Unwrappable</Typography>
                  <Typography variant='p_xlg'>{myBalance?.maxUnwrappableVal! >= 0.01 ? myBalance?.maxUnwrappableVal.toFixed(2) : '<0.01'} {pairData.tickerSymbol}</Typography>
                </MaxStack>

                <Controller
                  name="amountUnwrapAsset"
                  control={control}
                  rules={{
                    validate(value) {
                      if (!value || isNaN(value) || value <= 0) {
                        return 'the amount should not empty'
                      } else if (value > myBalance?.onassetVal!) {
                        return 'The amount cannot exceed the balance.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      title="You’re Unwrapping"
                      tickerIcon={pairData.tickerIcon}
                      ticker={pairData.tickerSymbol}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const unwrapAmt = parseFloat(event.currentTarget.value)
                        field.onChange(event.currentTarget.value)
                        calculateTotalAmountByFrom(unwrapAmt)
                      }}
                      onMax={(balance: number) => {
                        field.onChange(balance)
                        calculateTotalAmountByFrom(balance)
                      }}
                      value={field.value}
                      balance={myBalance?.onassetVal}
                      balanceDisabled={!publicKey}
                      tickerClickable={false}
                      max={myBalance?.onassetVal}
                    />
                  )}
                />
              </Box>
            }
          </Box>

          <Box height='100%'>
            <SwapButton onClick={handleChangeWrapType}>
              <Image src={oneWaySwapIcon} alt="swap" />
            </SwapButton>

            <PairInput
              title="To Receive"
              tickerIcon={pairData.tickerIcon}
              ticker={isWrap ? pairData.tickerSymbol : pairData.wrapTickerSymbol}
              value={isWrap ? amountWrapAsset : amountUnwrapAsset}
              balanceDisabled={true}
              valueDisabled={true}
              tickerClickable={!isWrap}
              onTickerClick={publicKey ? () => onShowSearchAsset() : () => setOpen(true)}
            />

            <Box my='5px'>
              {!publicKey ? <ConnectButton onClick={() => setOpen(true)}>
                <Typography variant='h4'>Connect Wallet</Typography>
              </ConnectButton> :
                isValid ?
                  <SubmitButton onClick={handleSubmit(onConfirm)} disabled={loading} sx={loading ? { border: '1px solid #c4b5fd' } : {}}>
                    {!loading ?
                      <Typography variant='p_xlg'>{isWrap ? 'Wrap' : 'Unwrap'}</Typography>
                      :
                      <Stack direction='row' alignItems='center' gap={2}>
                        <CircularProgress sx={{ color: '#c4b5fd' }} size={15} thickness={4} />
                        <Typography variant='p_xlg' color='#fff'>{isWrap ? 'Wrap' : 'Unwrap'}</Typography>
                      </Stack>}
                  </SubmitButton>
                  :
                  <DisableButton disabled={true}>
                    <Typography variant='p_xlg'>{invalidMsg()}</Typography>
                  </DisableButton>
              }
            </Box>

          </Box>
        </Box>
      </div>
    </>
  )
}

const SelectPoolBox = styled(Box)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 145px;
	height: 40px;
	background-color: rgba(37, 141, 237, 0.15);
	border-radius: 5px;
	cursor: pointer;
	padding: 8px;
  margin-top: 10px;
  margin-bottom: 25px;
	&:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.basis.liquidityBlue} inset;
		background-color: rgba(37, 141, 237, 0.23);
  }
`
const ConnectButton = styled(Button)`
	width: 142px;
	height: 42px;
	padding: 9px;
	border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
	box-shadow: 0 0 10px 0 #005874;
  margin-left: 16px;
	border-radius: 5px;
	color: #fff;
  &:hover {
		background: transparent;
		border: solid 1px ${(props) => props.theme.basis.gloomyBlue};
  }
	&:disabled {
		background: transparent;
		border: solid 1px ${(props) => props.theme.basis.gloomyBlue};
	}
`
const ConnectedButton = styled(Button)`
	width: 142px;
	height: 42px;
	padding: 9px;
	margin-left: 16px;
	border-radius: 5px;
	color: #fff;
	border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  background: ${(props) => props.theme.basis.jurassicGrey};
	&:hover {
		background: ${(props) => props.theme.basis.jurassicGrey};
    border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
  }
`
const NetworkBox = styled(Box)`
  display: flex;
  align-items: center;
  height: 28px;
  flex-grow: 0;
  padding: 6px 7px 6px 9px;
  border-radius: 5px;
  background-color: rgba(65, 78, 102, 0.5);
`
const MaxStack = styled(Stack)`
  width: 100%;
  height: 66px;
  border-radius: 10px;
  border: solid 1px ${(props) => props.theme.basis.slug};
  background-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 30px;
`
const SwapButton = styled(IconButton)`
  width: 35px;
  height: 35px;
  margin-top: 10px;
  margin-bottom: 6px;
  padding: 8px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
  }
`
const ConnectButton = styled(Button)`
  width: 100%;
  height: 52px;
  color: #fff;
  border: solid 1px #4fe5ff;
  border-radius: 5px;
  margin-top: 10px;
  &:hover {
    background: transparent;
    opacity: 0.6;
  }
`
const DisableButton = styled(Button)`
  width: 100%;
  height: 52px;
	color: #fff;
  border-radius: 5px;
	margin-top: 10px;
  &:disabled {
    border: solid 1px ${(props) => props.theme.basis.shadowGloom};
    background: transparent;
    color: #989898;
  } 
`

export default withSuspense(TradingComp1M, <Box mt='20px'><LoadingProgress /></Box>)
