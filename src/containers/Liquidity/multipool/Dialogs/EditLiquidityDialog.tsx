import React, { useState, useCallback } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Button, Stack, Dialog, FormHelperText, DialogContent } from '@mui/material'
import { useIncept } from '~/hooks/useIncept'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'
import { useForm, Controller } from 'react-hook-form'
import EditLiquidityRatioSlider from '~/components/Liquidity/multipool/EditLiquidityRatioSlider'
 
const EditLiquidityDialog = ({ open, handleClose }:  { open: any, handleClose: any }) => {
  const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const assetData = {
    tickerIcon: '/images/assets/euro.png',
    tickerName: 'iEURO',
    tickerSymbol: 'iEUR',
    price: 1.1,
  }

  const [defaultMintRatio, setDefaultMintRatio] = useState(0)
  const [mintRatio, setMintRatio] = useState(0)
  const {
		handleSubmit,
		control,
    setValue,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: 0.0,
      mintAmount: 0.0,
    }
	})
  const [collAmount, mintAmount] = watch([
		'collAmount',
		'mintAmount',
	])

  const initData = () => {
    setValue('collAmount', 0.0)
    setValue('mintAmount', 0.0)
  }

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    // calculateMintAmount(newRatio * maxMintable / 100)
    // setMintRatio(newRatio)
	}, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    // calculateMintAmount(mintAmount)
    // setMintRatio( maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
	}, [mintRatio, mintAmount])

  const isValid = Object.keys(errors).length === 0
  
  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={960}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px', overflow: 'hidden' }}>
          <Box sx={{ padding: '8px 28px', color: '#fff' }}>
          <HeaderText>Edit Liquidity Position</HeaderText>
            <Divider />

            <Stack direction='row' gap={4}>
              <SelectedPoolBox />
              
              <Box sx={{ minWidth: '550px', padding: '8px 18px', color: '#fff' }}>
                <div>Select amount of USDi & iSOL to mint into iSOL AMM</div>
                <Box sx={{ marginTop: '15px' }}>
                  <EditLiquidityRatioSlider min={0} max={100} ratio={60} currentRatio={50} assetData={assetData} mintAmount={mintAmount} currentMintAmount={0} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                </Box>

                <Divider />
                <Box>
                  <Box sx={{ fontSize: '14px', fontWeight: '500', marginLeft: '9px' }}>Projected Multipool Health Score <InfoTooltip title="Projected Multipool Health Score" /></Box>
                  <Box sx={{ fontSize: '20px', fontWeight: '500', textAlign: 'center' }}>74/100</Box>
                </Box>
                <Divider />

                <EditPositionButton>Edit Liquidity Position</EditPositionButton>
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

const EditPositionButton = styled(Button)`
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

export default EditLiquidityDialog

