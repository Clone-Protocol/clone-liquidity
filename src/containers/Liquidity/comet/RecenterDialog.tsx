import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box, Divider, styled, Button, Stack, Dialog, DialogContent, FormHelperText } from '@mui/material'
import ConcentrationRangeView from '~/components/Liquidity/comet/ConcentrationRangeView'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { useRecenterMutation } from '~/features/Comet/Comet.mutation'

const RecenterDialog = ({ assetId, open, handleClose }: { assetId: string, open: any, handleClose: any }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { mutateAsync } = useRecenterMutation(publicKey)

  const cometIndex = parseInt(assetId)

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
          <Box sx={{ padding: '8px 28px', color: '#fff' }}>
            <WarningBox>
              If this is your first interaction with Recenting, please click here to learn.
            </WarningBox>
            <Box sx={{ marginTop: '20px'}}>
              <Box display="flex" justifyContent="right">
                Wallet balance: 2000 USDi
              </Box>
              <Stack sx={{ borderRadius: '10px', border: 'solid 1px #444' }} direction="row" justifyContent="space-between">
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#fff9f9'}}>Recentering cost</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff'}}>
                  110.51 USDi
                </div>
              </Stack>
            </Box>

            <StyledDivider />
          
            <SubTitle>Projected Price Range</SubTitle>
            <Box sx={{ marginTop: '20px' }}>
              <ConcentrationRangeView 
                assetData={assetData}
                cometData={cometData}
                max={assetData.maxRange}
              />
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Center price</DetailHeader>
                <DetailValue>100.58 USD</DetailValue>
                {/* <DetailValue>{assetData?.centerPrice.toFixed(2)} USD</DetailValue> */}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Lower limit</DetailHeader>
                <DetailValue>100.58 USD</DetailValue>
                {/* <DetailValue>
                  {cometData.lowerLimit.toFixed(2)} USD
                </DetailValue> */}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Upper limit</DetailHeader>
                <DetailValue>100.58 USD</DetailValue>
                {/* <DetailValue>
                  {cometData.upperLimit.toFixed(2)} USD
                </DetailValue> */}
              </Stack>
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <SubTitle>Projected Health Score</SubTitle>
              <DetailValue>
                95/100 (prev. 75/100)
              </DetailValue>
            </Stack>

            <StyledDivider />
            <ActionButton onClick={() => handleRecenter()}>Recenter</ActionButton>
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
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 15px;
	margin-top: 15px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 600;
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

export default RecenterDialog