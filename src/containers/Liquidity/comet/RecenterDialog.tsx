import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import Image from 'next/image'
import WarningIcon from 'public/images/warning-icon.png'
import { Box, Divider, styled, Button, Stack, Dialog, DialogContent, FormHelperText } from '@mui/material'
import ConcentrationRangeView from '~/components/Liquidity/comet/ConcentrationRangeView'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { useRecenterMutation } from '~/features/Comet/Comet.mutation'
import { useBalanceQuery } from '~/features/Comet/Balance.query'

interface CometInfo {
  healthScore: number
  usdiCost: number
  centerPrice: number
	lowerLimit: number
  upperLimit: number
}

const RecenterDialog = ({ assetId, open, handleClose }: { assetId: string, open: any, handleClose: any }) => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { mutateAsync } = useRecenterMutation(publicKey)

  const isLackBalance = true
  const [cometData, setCometData] = useState<CometInfo>({
    healthScore: 95,
    usdiCost: 110.51,
    centerPrice: 100.58,
    lowerLimit: 50.43,
    upperLimit: 150.89
  })

  const cometIndex = parseInt(assetId)

  const { data: usdiBalance, refetch } = useBalanceQuery({ 
    userPubKey: publicKey, 
    refetchOnMount: true,
    enabled: publicKey != null
  });

  // defaultMintRatio
  useEffect(() => {
    async function fetch() {
      const program = getInceptApp()
      await program.loadManager()

      const { 
        healthScore,
        usdiCost,
        lowerPrice,
        upperPrice
      } = await program.calculateCometRecenterSinglePool(cometIndex)
      const balances = await program.getPoolBalances(cometIndex)
	    const price = balances[1] / balances[0]
      setCometData({
        healthScore,
        usdiCost,
        centerPrice: price,
        lowerLimit: lowerPrice,
        upperLimit: upperPrice
      })
    }
    fetch()
  }, [])

  const handleRecenter = async () => {
    // TODO: need to check it can recenter in advance (whether it already set trade in user's trading app)
    setLoading(true)
    await mutateAsync(
      {
        cometIndex
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to recenter')
            setLoading(false)
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to recenter : No price deviation detected.')
          setLoading(false)
        }
      }
    )
  }

  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px' }}>
          <Box sx={{ padding: '8px 18px', color: '#fff' }}>
            <WarningBox>
              If this is your first interaction with Recenting, please click here to learn.
            </WarningBox>
            <Box sx={{ marginTop: '20px', marginBottom: '22px'}}>
              <WalletBalance>
                Wallet balance: <span style={ isLackBalance ? { color: '#e9d100', marginLeft: '4px'} : {marginLeft: '4px'}}>{usdiBalance?.balanceVal.toLocaleString()} USDi</span>
              </WalletBalance>
              <Stack sx={{ borderRadius: '10px', border: 'solid 1px #444', padding: '12px 24px 12px 27px' }} direction="row" justifyContent="space-between">
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#fff9f9', marginTop: '3px'}}>Recentering cost</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff'}}>
                  {cometData.usdiCost} USDi
                </div>
              </Stack>
            </Box>

            <StyledDivider />
          
            <SubTitle>Projected Price Range</SubTitle>
            <Box sx={{ margin: '0 auto', marginTop: '20px', marginBottom: '33px', width: '345px' }}>
              <ConcentrationRangeView
                centerPrice={100}
                lowerLimit={cometData.lowerLimit}
                upperLimit={cometData.upperLimit}
                max={cometData.upperLimit}
              />
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Center price:</DetailHeader>
                <DetailValue>100.58 USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Lower limit:</DetailHeader>
                <DetailValue>{cometData.lowerLimit.toLocaleString()} USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Upper limit:</DetailHeader>
                <DetailValue>{cometData.upperLimit.toLocaleString()} USD</DetailValue>
              </Stack>
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <SubTitle>Projected Health Score</SubTitle>
              <DetailValue>
                {cometData.healthScore}/100 <span style={{ color: '#949494' }}>(prev. 75/100)</span>
              </DetailValue>
            </Stack>

            <StyledDivider />
            <ActionButton onClick={() => handleRecenter()}>Recenter</ActionButton>

            { isLackBalance && 
              <Stack
                sx={{
                  background: 'rgba(233, 209, 0, 0.04)',
                  border: '1px solid #e9d100',
                  borderRadius: '10px',
                  color: '#9d9d9d',
                  padding: '8px',
                  marginTop: '17px',
                }}
                direction="row">
                <Box sx={{ width: '53px', marginLeft: '20px', textAlign: 'center' }}>
                  <Image src={WarningIcon} />
                </Box>
                <NotEnoughBox>
                  Not enough wallet balance to pay for the cost.
                </NotEnoughBox>
              </Stack>
            }
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
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
  padding-left: 40px;
  padding-right: 40px;
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 15px;
	margin-top: 15px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
  margin-bottom: 5px;
`

const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 11px;
	font-weight: 500;
	color: #fff;
`

const WalletBalance = styled(Box)`
  display: flex;
  justify-content: right;
  color: #949494; 
  font-size: 12px;
  font-weight: 500; 
  margin-right: 10px;
  margin-bottom: 4px;
`

const ActionButton = styled(Button)`
	width: 100%;
	height: 45px;
  flex-grow: 0;
  border-radius: 10px;
  background-color: #4e609f;
  font-size: 13px;
  font-weight: 600;
	color: #fff;
`

const NotEnoughBox = styled(Box)`
	max-width: 500px;
  padding-left: 36px;
  padding-top: 4px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

export default RecenterDialog