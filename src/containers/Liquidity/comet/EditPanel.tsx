import React, { useState } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import EditDetailDialog from './EditDetailDialog'
import RecenterDialog from './RecenterDialog'

const EditPanel = ({ assetId, cometDetail, balance, onRefetchData }: { assetId: string, cometDetail: CometDetail, balance: number, onRefetchData: () => void }) => {
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
  const [openRecenter, setOpenRecenter] = useState(false)

  const cometIndex = parseInt(assetId)

  return assetData ? (
    <>
      <Wrapper>
        <PositionInfo
          assetData={assetData}
          cometDetail={cometDetail}
          onShowEditForm={() => {
            if (cometDetail.collAmount > 0) {
              setOpenEditDetail(true)
            }
          }}
          onRecenter={() => {
            setOpenRecenter(true)
          }}
        />

        <EditDetailDialog
          open={openEditDetail}
          cometId={cometIndex}
          balance={balance}
          assetData={assetData}
          cometDetail={cometDetail}
          onHideEditForm={() => setOpenEditDetail(false)}
          onRefetchData={() => onRefetchData()}
        />

        <RecenterDialog
          assetId={assetId}
          open={openRecenter}
          handleClose={() => setOpenRecenter(false)}
        />
      </Wrapper>
    </>
  ) : <></>
}

const Wrapper = styled(Box)`
  color: #fff;
  border-radius: 10px;
`

export default EditPanel
