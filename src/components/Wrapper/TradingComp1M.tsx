import { Box, Stack, Button, IconButton, Typography, CircularProgress, Popover } from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useState, useEffect } from 'react'
import PairInput from './PairInput'
import Image from 'next/image'
import oneWaySwapIcon from 'public/images/oneway-swap.svg'
import walletIcon from 'public/images/wallet-icon-small.svg'
import { useForm, Controller } from 'react-hook-form'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { SubmitButton } from '../Common/CommonButtons'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'
import { shortenAddress } from '~/utils/address'
import { assetMapping } from '~/data/assets_evm'
import WalletOptionSelect from './WalletOptionSelect'
import { BaseError, useAccount, useConnect, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useWriteContracts } from 'wagmi/experimental'
import { getPEPE1MContractAddress, getPEPEContractAddress } from '~/wrapper/chains'
import { wrapped1MPEPETokenAbi } from '~/wrapper/contracts/abi/WrappedPepeContract'
import { PEPETokenAbi } from '~/wrapper/contracts/abi/PepeContract'

interface Props {
  assetIndex: number
  onShowSearchAsset: () => void
}

const TradingComp1M: React.FC<Props> = ({ assetIndex, onShowSearchAsset }) => {
  const { publicKey } = useWallet()
  const [isWrap, setIsWrap] = useState(true)
  const { setOpen } = useWalletDialog()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const openPopover = Boolean(anchorEl);
  const popoverId = openPopover ? 'simple-popover' : undefined;
  const { isConnected, address, chain } = useAccount();
  const { connectors, connect } = useConnect()
  const { chains, switchChain } = useSwitchChain()

  const pairData = assetMapping(assetIndex)

  const { data: myBalance, refetch } = useReadContract({
    address: isWrap ? getPEPEContractAddress(chain) : getPEPE1MContractAddress(chain),
    abi: wrapped1MPEPETokenAbi,
    functionName: 'balanceOf',
    account: address,
    args: [address],
    query: {
      enabled: !!address,
    }
  })
  // console.log('m', myBalance)

  const { data: hash, writeContract, isPending, error } = useWriteContract()
  // const { writeContracts } = useWriteContracts()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      query: {
        enabled: !!hash,
      }
    });

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

  useEffect(() => {
    if (isConfirmed) {
      initData()
      refetch()
    }
  }, [isConfirmed])

  const handleWalletClick = async () => {
    try {
      const arbitrumChainId = chains[0].id
      if (chain?.id !== arbitrumChainId) {
        // await switchChain({ chainId: arbitrumChainId })
      }
      // @TODO: use wallet adapter - connectors
      await connect({ connector: connectors[0] })

      console.log('c', chains[0])
    } catch (error) {
      console.error('e', error)
    }
  }

  const handleWalletOptionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }
  const handleWalletOptionClose = () => {
    setAnchorEl(null);
  };

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

  const calculateTotalAmountByFrom = (newValue: number) => {
    if (isWrap) {
      setValue('amountWrapAsset', newValue)
    } else {
      setValue('amountUnwrapAsset', newValue)
    }
  }

  const onConfirm = async () => {
    try {
      console.log('dd', amountWrapAsset)

      // await writeContract({
      //   address: getPEPE1MContractAddress(chain),
      //   abi: wrapped1MPEPETokenAbi,
      //   functionName: 'approve',
      //   args: [getPEPEContractAddress(chain), isWrap ? BigInt(amountWrapAsset * 10 ** 18) : BigInt(amountUnwrapAsset)],
      // })
      await writeContract({
        address: getPEPEContractAddress(chain),
        abi: PEPETokenAbi,
        functionName: 'approve',
        args: [getPEPE1MContractAddress(chain), isWrap ? BigInt(amountWrapAsset) : BigInt(amountUnwrapAsset)],
      })

      await writeContract({
        address: getPEPE1MContractAddress(chain),
        abi: wrapped1MPEPETokenAbi,
        functionName: isWrap ? 'mint' : 'burn',
        args: [isWrap ? BigInt(amountWrapAsset) : BigInt(amountUnwrapAsset)],
      })

      // await writeContracts({
      //   contracts: [
      //     {
      //       address: getPEPE1MContractAddress(chain),
      //       abi: wrapped1MPEPETokenAbi,
      //       functionName: 'approve',
      //       args: [getPEPE1MContractAddress(chain), isWrap ? BigInt(amountWrapAsset) : BigInt(amountUnwrapAsset)],
      //     },
      //     {
      //       address: getPEPE1MContractAddress(chain),
      //       abi: wrapped1MPEPETokenAbi,
      //       functionName: isWrap ? 'mint' : 'burn',
      //       args: [isWrap ? BigInt(amountWrapAsset) : BigInt(amountUnwrapAsset)],
      //     }
      //   ]
      // })


    } catch (err) {
      console.error(err)
      // setLoading(false)
    }
  }

  const invalidMsg = () => {
    if (isWrap && (amountWrapAsset == 0 || isNaN(amountWrapAsset) || !amountWrapAsset)) {
      return 'Enter Amount'
    } else if (!isWrap && (amountUnwrapAsset == 0 || isNaN(amountUnwrapAsset) || !amountUnwrapAsset)) {
      return 'Enter Amount'
    } else if (isWrap && amountWrapAsset > myBalance) {
      return `Insufficient ${pairData.fromTickerSymbol}`
    } else if (!isWrap && amountUnwrapAsset > myBalance) {
      return `Insufficient ${pairData.toTickerSymbol}`
    } else {
      return ''
    }
  }

  const isValid = invalidMsg() === ''

  return (
    <>
      <div style={{ width: '100%', height: '100%' }}>
        <Box sx={{ paddingBottom: { xs: '150px', md: '3px' } }}>
          <Box>
            <Box>
              <Box display='flex' justifyContent='flex-start'>
                <Box><Typography variant='p_lg' color='#66707e'>Token</Typography></Box>
              </Box>
              <SelectPoolBox onClick={publicKey ? () => onShowSearchAsset() : () => setOpen(true)}>
                <Stack direction='row' gap={1}>
                  <Image src={pairData.tickerIcon} width={24} height={24} alt={pairData.tickerName} />
                  <Typography variant='p_xlg'>{pairData.tickerName}</Typography>
                </Stack>
                <Image src={SelectArrowIcon} alt='select' />
              </SelectPoolBox>

              <Box display='flex' justifyContent='flex-start'>
                <Box><Typography variant='p_lg' color='#66707e'>Connect Wallet</Typography></Box>
              </Box>
              <Stack direction='row' alignItems='center' gap='10px' mb='20px'>
                <Box>
                  {
                    !isConnected ?
                      <ConnectWalletButton
                        onClick={handleWalletClick}
                      >
                        <Typography variant='p_lg'>Connect Wallet</Typography>
                      </ConnectWalletButton>
                      :
                      <ConnectedButton aria-describedby={popoverId} onClick={handleWalletOptionClick} startIcon={address ? <Image src={walletIcon} alt="wallet" /> : <></>}>
                        <Typography variant='p'>{address && shortenAddress(address.toString())}</Typography>
                        <Box ml='10px'><Image src={SelectArrowIcon} alt='select' /></Box>
                      </ConnectedButton>
                  }
                  {address &&
                    <Popover
                      id={popoverId}
                      open={openPopover}
                      anchorEl={anchorEl}
                      onClose={handleWalletOptionClose}
                      disableRestoreFocus
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                      <WalletOptionSelect address={address} onClose={handleWalletOptionClose} />
                    </Popover>
                  }
                </Box>
                <NetworkBox><Typography variant='p'>Arbitrum Network</Typography></NetworkBox>
              </Stack>
            </Box>

            {isWrap ?
              <Box>
                <Controller
                  name="amountWrapAsset"
                  control={control}
                  rules={{
                    validate(value) {
                      if (!value || isNaN(value) || value <= 0) {
                        return 'the amount should not empty'
                      } else if (value > myBalance) {
                        return 'The amount cannot exceed the balance.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      title="You’re Wrapping"
                      tickerIcon={pairData.tickerIcon}
                      ticker={pairData.fromTickerSymbol}
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
                      balance={myBalance}
                      balanceDisabled={!publicKey}
                      tickerClickable={false}
                      max={myBalance}
                    />
                  )}
                />
              </Box>
              :
              <Box>
                <Controller
                  name="amountUnwrapAsset"
                  control={control}
                  rules={{
                    validate(value) {
                      if (!value || isNaN(value) || value <= 0) {
                        return 'the amount should not empty'
                      } else if (value > myBalance) {
                        return 'The amount cannot exceed the balance.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      title="You’re Unwrapping"
                      tickerIcon={pairData.tickerIcon}
                      ticker={pairData.toTickerSymbol}
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
                      balance={myBalance}
                      balanceDisabled={!publicKey}
                      tickerClickable={false}
                      max={myBalance}
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
              ticker={isWrap ? pairData.toTickerSymbol : pairData.fromTickerSymbol}
              value={isWrap ? amountWrapAsset : amountUnwrapAsset}
              balanceDisabled={true}
              valueDisabled={true}
              tickerClickable={!isWrap}
              onTickerClick={publicKey ? () => onShowSearchAsset() : () => setOpen(true)}
            />

            <Box mt='5px'>
              {!publicKey ? <ConnectButton onClick={() => setOpen(true)}>
                <Typography variant='h4'>Connect Wallet</Typography>
              </ConnectButton> :
                isValid ?
                  <SubmitButton onClick={handleSubmit(onConfirm)} disabled={isPending} sx={isPending ? { border: '1px solid #c4b5fd' } : {}}>
                    {!isPending ?
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
            <Box>
              {isConfirming && <><Typography variant='p'>Waiting for confirmation...</Typography></>}
              {isConfirmed && <><Typography variant='p'>Transaction confirmed.</Typography></>}
              {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
              )}
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
  width: 200px;
	height: 30px;
	background-color: rgba(65, 75, 102, 0.5);
	border-radius: 100px;
	cursor: pointer;
	padding: 5px;
  margin-top: 5px;
  margin-bottom: 20px;
	&:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.basis.liquidityBlue} inset;
		background-color: rgba(37, 141, 237, 0.23);
  }
`
const ConnectWalletButton = styled(Button)`
	width: 134px;
	height: 42px;
	padding: 9px;
	border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
	box-shadow: 0 0 10px 0 #005874;
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
	width: 167px;
	height: 42px;
	padding: 9px;
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
