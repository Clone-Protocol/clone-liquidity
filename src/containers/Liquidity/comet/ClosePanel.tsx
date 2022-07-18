import React, { useState } from 'react'
import { Box, Stack, Button } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCloseMutation } from '~/features/Comet/Comet.mutation'
import { CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

const ClosePanel = ({ assetId, cometDetail }: { assetId: string, cometDetail: CometDetail }) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { mutateAsync } = useCloseMutation(publicKey)

	const cometIndex = parseInt(assetId)

	const onClose = async (cType: number) => {
    setLoading(true)
    await mutateAsync(
      {
        cometIndex,
        cType
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to close comet')
            setLoading(false)
            router.push('/liquidity')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to close comet')
          setLoading(false)
        }
      }
    )
	}

  const noBorrowedAsset = cometDetail.mintIassetAmount === 0 && cometDetail.mintAmount === 0

	return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Box sx={{ padding: '30px', background: 'rgba(21, 22, 24, 0.75)', borderRadius: '10px', marginTop: '17px' }}>
        <WarningBox>
          Click here to learn more about how closing comet works.
        </WarningBox>
        <Title>Close Comet</Title>
        <Box sx={{ padding: '0px 24px 9px 15px' }}>
          <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
            <DetailHeader>ILD Dept</DetailHeader>
            <TotalValue>{cometDetail.ild.toLocaleString()} USDi</TotalValue>
          </Stack>
          <Stack sx={{ marginTop: '5px' }} direction="row" justifyContent="space-between">
            <DetailHeader>Collateral Withdraw</DetailHeader>
            <TotalValue>{cometDetail.collAmount.toLocaleString()} USDi</TotalValue>
          </Stack>
        </Box>
        
        <ActionButton onClick={onClose} disabled={!noBorrowedAsset}>
          <Image src={OneIcon} width={17} /> 
          <div>Withdraw liquidity & pay ILD</div> 
          <div>{ !noBorrowedAsset && <CheckCircleOutlineRoundedIcon fontSize="small" sx={{ color:'#809cff', marginTop: '2px'}}  />}</div>
        </ActionButton>
        <ActionButton onClick={onClose} disabled={noBorrowedAsset}><Image src={TwoIcon} width={17} /> <div>Close comet & withdraw Collateral</div> <div></div></ActionButton>
      </Box>
    </>
	)
}

const WarningBox = styled(Box)`
	max-width: 401px;
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
  margin-bottom: 23px;
`

const Title = styled('div')`
	font-size: 16px;
	font-weight: 600;
	color: #fff;
  margin-left: 15px;
	margin-bottom: 15px;
`

const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 600;
	color: #989898;
`

const TotalValue = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`

const ActionButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 13px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default ClosePanel
