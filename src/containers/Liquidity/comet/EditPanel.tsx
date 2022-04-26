import React, { useState, useCallback } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { PositionInfo as PI, CometInfo, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
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
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    collRatio: 50,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  })
  const mintAmount = cometDetail.mintAmount
	const [collAmount, setCollAmount] = useState(cometDetail.collAmount)
  const ild = cometDetail.ild
  const [openEditDetail, setOpenEditDetail] = useState(false)

	const cometIndex = parseInt(assetId)

	return assetData ? (
    <Wrapper>
      <PositionInfo
        assetData={assetData}
        cometData={cometData}
        mintAmount={mintAmount}
        collateralAmount={collAmount}
        ild={ild}
        onShowEditForm={() => setOpenEditDetail(true)}
      />

      <EditDetailDialog
        open={openEditDetail}
        cometId={cometIndex}
        assetData={assetData}
        cometDetail={cometDetail}
        handleClose={() => setOpenEditDetail(false)}
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
