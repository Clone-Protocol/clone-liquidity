import React, { useState } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import EditDetailDialog from './EditDetailDialog'

const EditPanel = ({ assetId, cometDetail }: { assetId: string, cometDetail: CometDetail }) => {
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

	const cometIndex = parseInt(assetId)

  const handleRecenter = () => {
    // TODO: recenter logic    
  }

	return assetData ? (
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
        assetData={assetData}
        cometDetail={cometDetail}
        onHideEditForm={() => setOpenEditDetail(false)}
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
