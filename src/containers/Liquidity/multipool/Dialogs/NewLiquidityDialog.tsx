import React, { useState, useCallback } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Button, Stack, Dialog, FormHelperText, DialogContent } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import RatioSlider from '~/components/Asset/RatioSlider'
import { SliderTransition } from '~/components/Common/Dialog'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'
import PairInput from '~/components/Asset/PairInput'
import InfoTooltip from '~/components/Common/InfoTooltip'
// import { useLiquidityDetailQuery } from '~/features/MyLiquidity/multipool/LiquidityPosition.query'
import PairInputView from '~/components/Asset/PairInputView'
import { useForm, Controller } from 'react-hook-form'

const NewLiquidityDialog = ({ open, assetIndex, handleClose }:  { open: any, assetIndex: number, handleClose: any }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)

  const [maxMintable, setMaxMintable] = useState(0.0)
  const [mintRatio, setMintRatio] = useState(50)

  // const { data: assetData } = useLiquidityDetailQuery({
  //   userPubKey: publicKey,
  //   index: assetIndex,
	//   refetchOnMount: true,
  //   enabled: open && publicKey != null
	// })

  const {
		handleSubmit,
		control,
    setValue,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      mintAmount: maxMintable * mintRatio / 100,
    }
	})
  const [mintAmount] = watch([
		'mintAmount',
	])

  const handleChangeMintRatio = useCallback( async (event: Event, newValue: number | number[]) => {
	  if (typeof newValue === 'number') {
      setValue('mintAmount', maxMintable * newValue / 100)
      setMintRatio(newValue)
	  }
	}, [maxMintable])

  const onNewLiquidity = async () => {

  }

  const isValid = Object.keys(errors).length === 0
  
  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={960}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px' }}>
          <Box sx={{ padding: '8px 28px', color: '#fff' }}>
            <HeaderText>Establish New Liquidity Position</HeaderText>
            <Divider />

            <Stack direction='row' gap={4}>
              <SelectedPoolBox />
              
              <Box sx={{ minWidth: '550px', padding: '8px 18px', color: '#fff' }}>
                <div>Select amount of USDi & iSOL to mint into iSOL AMM</div>
                <Box sx={{ marginTop: '15px' }}>
                  <RatioSlider min={0} max={100} value={mintRatio} hideValueBox onChange={handleChangeMintRatio} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '-8px'}}>
                    <Box sx={{ fontSize: '11px', fontWeight: '500' }}>Min</Box>
                    <Box sx={{ fontSize: '11px', fontWeight: '500' }}>Max</Box>
                  </Box>
                </Box>
                <Box sx={{ marginBottom: '25px', marginTop: '15px' }}>
                  <Controller
                    name="mintAmount"
                    control={control}
                    rules={{
                      validate(value) {
                        if (!value || value <= 0) {
                          return 'the mint amount should be above zero'
                        }
                      }
                    }}
                    render={({ field }) => (
                      <PairInput
                        tickerIcon={'/images/assets/USDi.png'}
                        tickerName="USDi Coin"
                        tickerSymbol="USDi"
                        value={parseFloat(field.value.toFixed(3))}
                        headerTitle="Max amount mintable"
                        headerValue={maxMintable}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          const mintVal = parseFloat(event.currentTarget.value)
                          field.onChange(mintVal)
                          maxMintable > 0 ? setMintRatio(mintVal * 100 / maxMintable) : 0
                        }}
                        onMax={(value: number) => {
                          field.onChange(value)
                          maxMintable > 0 ? setMintRatio(value * 100 / maxMintable) : 0
                        }}
                      />
                    )}
                  />
                  <FormHelperText error={!!errors.mintAmount?.message}>{errors.mintAmount?.message}</FormHelperText>
                </Box>
                <PairInputView
                  tickerIcon={'/images/assets/euro.png'}
                  tickerSymbol={'iEUR'}
                  value={0}
                />

                <FormStack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>Total liquidity value of the position: </Box>
                  <Box sx={{ fontSize: '16px' }}>$18,354.32</Box>
                </FormStack>

                <Divider />
                <Box>
                  <Box sx={{ fontSize: '14px', fontWeight: '500', marginLeft: '9px' }}>Projected Multipool Health Score <InfoTooltip title="Projected Multipool Health Score" /></Box>
                  <Box sx={{ fontSize: '20px', fontWeight: '500', textAlign: 'center' }}><span style={{fontSize: '32px', fontWeight: 'bold'}}>21</span>/100</Box>
                </Box>
                <Divider />

                <NewPositionButton onClick={handleSubmit(onNewLiquidity)} disabled={!isDirty || !isValid}>Establish New Position</NewPositionButton>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

const HeaderText = styled(Box)`
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #fff;
`

const Divider = styled('div')`
  width: 100%;
  height: 1px;
  margin-top: 17px;
  margin-bottom: 10px;
  background-color: #2c2c2c;
`

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  background: rgba(21, 22, 24, 0.75);
	border-radius: 8px;
	border: solid 1px #5c5c5c;
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 500;
`

const NewPositionButton = styled(Button)`
	width: 100%;
	background-color: #4e3969;
	color: #fff;
	border-radius: 10px;
  margin-top: 10px;
	margin-bottom: 15px;
  font-size: 14px;
  font-weight: 600;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default NewLiquidityDialog

