import React, { useState } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import EditDetailDialog from './EditDetailDialog'
import { useRecenterMutation } from '~/features/Comet/Comet.mutation'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const EditPanel = ({ assetId, cometDetail, balance }: { assetId: string, cometDetail: CometDetail, balance: number }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

	const assetData: PI = {
    tickerIcon: cometDetail.tickerIcon,
    tickerName: cometDetail.tickerName,
    tickerSymbol: cometDetail.tickerSymbol,
    price: cometDetail.price,
    tightRange: cometDetail.tightRange,
    maxRange: cometDetail.maxRange,
    centerPrice: cometDetail.centerPrice
  }
  const [openEditDetail, setOpenEditDetail] = useState(false)
  const { mutateAsync } = useRecenterMutation(publicKey)

	const cometIndex = parseInt(assetId)

  const handleRecenter = async () => {
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
          enqueueSnackbar('Failed to recenter')
          setLoading(false)
        }
      }
    )
  }

	return assetData ? (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}
      
      <Wrapper>
        <PositionInfo
          assetData={assetData}
          cometDetail={cometDetail}
          onShowEditForm={() => setOpenEditDetail(true)}
          onRecenter={() => handleRecenter()}
        />

        <EditDetailDialog
          open={openEditDetail}
          cometId={cometIndex}
          balance={balance}
          assetData={assetData}
          cometDetail={cometDetail}
          onHideEditForm={() => setOpenEditDetail(false)}
        />
      </Wrapper>
    </>
	) : <></>
}

const Wrapper = styled(Box)`
  color: #fff;
  background: rgba(21, 22, 24, 0.75);
  border-radius: 10px;
`

export default EditPanel
