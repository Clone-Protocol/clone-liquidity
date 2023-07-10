import React, { useState } from 'react'
import { Box } from '@mui/material'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import dynamic from 'next/dynamic'

const EditPanel = ({ assetId, borrowDetail, onRefetchData }: { assetId: string, borrowDetail: BorrowDetail, onRefetchData: () => void }) => {
  const [openEditDetail, setOpenEditDetail] = useState(false)
  const [openBorrowMore, setOpenBorrowMore] = useState(false)
  const borrowIndex = parseInt(assetId)
  const EditDetailDialog = dynamic(() => import('./EditDetailDialog'))
  const EditBorrowMoreDialog = dynamic(() => import('./EditBorrowMoreDialog'))

  return borrowDetail ? (
    <Box>
      <PositionInfo
        positionInfo={borrowDetail}
        onShowEditForm={() => setOpenEditDetail(true)}
        onShowBorrowMore={() => setOpenBorrowMore(true)}
      />

      <EditDetailDialog
        open={openEditDetail}
        borrowId={borrowIndex}
        borrowDetail={borrowDetail}
        onHideEditForm={() => setOpenEditDetail(false)}
        onRefetchData={() => onRefetchData()}
      />

      <EditBorrowMoreDialog
        open={openBorrowMore}
        borrowId={borrowIndex}
        borrowDetail={borrowDetail}
        onHideEditForm={() => setOpenBorrowMore(false)}
        onRefetchData={() => onRefetchData()}
      />
    </Box>
  ) : <></>
}

export default EditPanel
