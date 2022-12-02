import { Box, Stack, Grid, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import RecenterDialog from './Dialogs/RecenterDialog'
import AddPositionDialog from './Dialogs/AddPositionDialog'
import LiquidityPairView from '~/components/Liquidity/multipool/LiquidityPairView'
import NewLiquidityDialog from './Dialogs/NewLiquidityDialog'
import EditLiquidityDialog from './Dialogs/EditLiquidityDialog'
import { LiquidityPosition } from '~/features/MyLiquidity/multipool/MultipoolInfo.query'

const LiquidityPositions = ({ positions, onRefetchData } : { positions: LiquidityPosition[], onRefetchData: any }) => {
  const [openAddPosition, setOpenAddPosition] = useState(false)
  const [openNewLiquidity, setOpenNewLiquidity] = useState(false)
  const [openEditLiquidity, setOpenEditLiquidity] = useState(false)
  const [openRecenter, setOpenRecenter] = useState(false)

  const [selectAssetId, setSelectAssetId] = useState(0)
  const [editAssetId, setEditAssetId] = useState(0)
  const [poolIndex, setPoolIndex] = useState(0)

  const handleChoosePosition = (assetId: number) => {
    console.log('assetId', assetId)
    setSelectAssetId(assetId)
    setOpenNewLiquidity(true)
  }

  const handleChooseEditPosition = (positionIndex: number) => {
    console.log('positionIndex', positionIndex)
    setPoolIndex(Number(positions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenEditLiquidity(true)
  }

  return (
    <>
      <Box>
        {positions.map((position, index) => 
          <LiquidityPairView
            poolIndex={index}
            tickerIcon={position.tickerIcon}
            tickerSymbol={position.tickerSymbol}
            value={position.liquidityDollarPrice}
            onShowEditDialog={handleChooseEditPosition}
            onShowRecenterDialog={() => setOpenRecenter(true)}
          />
        )}
      </Box>
      <Stack direction='row' justifyContent='space-between' sx={{ marginTop: '9px' }}>
        <AddButton onClick={() => setOpenAddPosition(true)}>Add Position</AddButton>
        <RecenterAllButton onClick={() => setOpenRecenter(true)}>Recenter all</RecenterAllButton>
      </Stack>

      <AddPositionDialog
        open={openAddPosition}
        handleChoosePosition={handleChoosePosition}
        handleClose={() => setOpenAddPosition(false)}
      />
      <NewLiquidityDialog
        open={openNewLiquidity}
        assetIndex={selectAssetId}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenNewLiquidity(false)}
      />
      <EditLiquidityDialog
        open={openEditLiquidity}
        positionIndex={editAssetId}
        poolIndex={poolIndex}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenEditLiquidity(false)}
      />
      <RecenterDialog
        assetId='0'
        open={openRecenter}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenRecenter(false)}
      />
    </>
  )

}

const AddButton = styled(Button)`
  background: #1d1d1d;
  width: 112px;
  height: 26px;
  padding: 4px 0;
  border-radius: 10px;
  border: solid 1px #535353;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
`

const RecenterAllButton = styled(Button)`
  width: 109px;
  height: 26px;
  padding: 1px 0;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  border-radius: 10px;
  border: 1px solid transparent;
  border-image-slice: 1;
  background-image: linear-gradient(to bottom, #000, #000), linear-gradient(to bottom, #8c73ac 0%, #7d17ff 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
`

export default LiquidityPositions