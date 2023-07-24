import { Box, Stack, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import LiquidityPairView from '~/components/Liquidity/comet/LiquidityPairView'
import { LiquidityPosition } from '~/features/MyLiquidity/comet/CometInfo.query'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const LiquidityPositions = ({ positions, onRefetchData }: { positions: LiquidityPosition[], onRefetchData: () => void }) => {
  const router = useRouter()
  // const [openNewLiquidity, setOpenNewLiquidity] = useState(false)
  const [openEditLiquidity, setOpenEditLiquidity] = useState(false)
  const [openClosePosition, setOpenClosePosition] = useState(false)
  const [editAssetId, setEditAssetId] = useState(0)
  const [poolIndex, setPoolIndex] = useState(0)
  const EditLiquidityDialog = dynamic(() => import('./Dialogs/EditLiquidityDialog'))
  const CloseLiquidityDialog = dynamic(() => import('./Dialogs/CloseLiquidityDialog'))

  const handleChooseEditPosition = (positionIndex: number) => {
    setPoolIndex(Number(positions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenEditLiquidity(true)
  }

  const handleShowClosePositionDialog = (positionIndex: number) => {
    setPoolIndex(Number(positions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenClosePosition(true)
  }

  const handleShowCloseLiquidityDialog = () => {
    setOpenEditLiquidity(false)
    setOpenClosePosition(true)
  }

  const redirectAddCometPage = () => {
    router.push(`/assets/euro`)
  }

  // const { mutateAsync } = useRecenterAllMutation(publicKey)
  // const handleRecenterAll = async () => {
  //   try {
  //     const data = await mutateAsync(
  //       {
  //         poolIndex
  //       }
  //     )
  //     if (data.result) {
  //       onRefetchData()
  //     }
  //   } catch (err) {
  //     console.error('err', err)
  //   }
  // }

  return (
    <>
      <Box>
        <PairHeader>
          <Box><Typography variant="p_sm">Pool</Typography></Box>
          <Box ml='45px'><Typography variant="p_sm">Liquidity Value</Typography></Box>
          <Box ml='-90px'><Typography variant="p_sm">ILD</Typography></Box>
          <Box></Box>
        </PairHeader>
        {positions.map((position, index) =>
          <LiquidityPairView
            key={index}
            poolIndex={index}
            tickerIcon={position.tickerIcon}
            tickerSymbol={position.tickerSymbol}
            value={position.liquidityDollarPrice}
            ildInUsdi={position.ildInUsdi}
            ildValue={position.ildValue}
            onShowEditDialog={handleChooseEditPosition}
            onShowClosePositionDialog={handleShowClosePositionDialog}
          />
        )}
      </Box>
      <Stack direction='row' justifyContent='space-between' marginTop='9px'>
        {positions.length > 0 ?
          <AddButton onClick={redirectAddCometPage}><Typography variant='p_sm'>+ New Liquidity Pool</Typography></AddButton>
          :
          <AddButtonNoPosition onClick={redirectAddCometPage}><Typography variant='p_sm'>+ New Liquidity Pool</Typography></AddButtonNoPosition>
        }
        {/* <RecenterAllButton onClick={() => handleRecenterAll()}>Recenter all</RecenterAllButton> */}
      </Stack>

      {/* <NewLiquidityDialog
        open={openNewLiquidity}
        assetIndex={selectAssetId}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenNewLiquidity(false)}
      /> */}
      <EditLiquidityDialog
        open={openEditLiquidity}
        positionIndex={editAssetId}
        poolIndex={poolIndex}
        onShowCloseLiquidity={handleShowCloseLiquidityDialog}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenEditLiquidity(false)}
      />
      <CloseLiquidityDialog
        open={openClosePosition}
        positionIndex={editAssetId}
        poolIndex={poolIndex}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenClosePosition(false)}
      />
    </>
  )

}

const PairHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 26px;
  color: ${(props) => props.theme.palette.text.secondary};
  border-top: 1px solid ${(props) => props.theme.boxes.greyShade};
`
const AddButton = styled(Button)`
  width: 100%;
  height: 28px;
  padding: 4px 0;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  color: ${(props) => props.theme.palette.text.secondary};
  margin-top: 9px;
  &:hover {
    background: ${(props) => props.theme.boxes.darkBlack};
    color: #fff;
    border-color: ${(props) => props.theme.palette.text.secondary};
  }
`
const AddButtonNoPosition = styled(AddButton)`
  border-color: ${(props) => props.theme.palette.info.main};
  color: #fff;
  &:hover {
    border-color: ${(props) => props.theme.palette.info.main};
  }
`

export default LiquidityPositions