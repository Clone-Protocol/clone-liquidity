import React, { useState } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import EditDetailDialog from './EditDetailDialog'
import EditBorrowMoreDialog from './EditBorrowMoreDialog'

const EditPanel = ({ assetId, borrowDetail, onRefetchData }: { assetId: string, borrowDetail: BorrowDetail, onRefetchData: () => void }) => {
  const [openEditDetail, setOpenEditDetail] = useState(false)
  const [openBorrowMore, setOpenBorrowMore] = useState(false)
  const borrowIndex = parseInt(assetId)

	return borrowDetail ? (
    <Wrapper>
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
        onRefetchData={() => onRefetchData() }
      />

      <EditBorrowMoreDialog
        open={openBorrowMore}
        borrowId={borrowIndex}
        borrowDetail={borrowDetail}
        onHideEditForm={() => setOpenBorrowMore(false)}
        onRefetchData={() => onRefetchData() }
      />
    </Wrapper>
	) : <></>
}

const Wrapper = styled(Box)`
  color: #fff;
  background: rgba(21, 22, 24, 0.75);
  border-radius: 10px;
`

export default EditPanel
