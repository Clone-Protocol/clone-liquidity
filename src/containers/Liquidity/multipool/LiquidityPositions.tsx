import { Box, Stack, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import RecenterDialog from '~/containers/Liquidity/multipool/Dialogs/RecenterDialog'
import LiquidityPairView from '~/components/Liquidity/multipool/LiquidityPairView'
import EditLiquidityDialog from './Dialogs/EditLiquidityDialog'
import { LiquidityPosition } from '~/features/MyLiquidity/multipool/MultipoolInfo.query'
// import { useRecenterAllMutation } from '~/features/MyLiquidity/multipool/Recenter.mutation'
import { useRouter } from 'next/router'
import CloseLiquidityDialog from './Dialogs/CloseLiquidityDialog'

const LiquidityPositions = ({ positions, onRefetchData }: { positions: LiquidityPosition[], onRefetchData: () => void }) => {
  // const { publicKey } = useWallet()
  // const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // const [openAddPosition, setOpenAddPosition] = useState(false)
  // const [openNewLiquidity, setOpenNewLiquidity] = useState(false)
  const [openEditLiquidity, setOpenEditLiquidity] = useState(false)
  const [openRecenter, setOpenRecenter] = useState(false)
  const [openClosePosition, setOpenClosePosition] = useState(false)

  // const [selectAssetId, setSelectAssetId] = useState(0)
  const [editAssetId, setEditAssetId] = useState(0)
  const [poolIndex, setPoolIndex] = useState(0)

  // const handleChoosePosition = (assetId: number) => {
  //   setSelectAssetId(assetId)
  //   setOpenNewLiquidity(true)
  // }

  const handleChooseEditPosition = (positionIndex: number) => {
    setPoolIndex(Number(positions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenEditLiquidity(true)
  }

  const handleChooseRecenter = (positionIndex: number) => {
    setPoolIndex(Number(positions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenRecenter(true)
  }

  const handleShowClosePositionDialog = (positionIndex: number) => {
    setPoolIndex(Number(positions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenClosePosition(true)
  }

  const redirectAddMultipoolPage = () => {
    router.push(`/assets/0/asset`)
  }

  // const { mutateAsync } = useRecenterAllMutation(publicKey)
  // const handleRecenterAll = async () => {
  //   setLoading(true)
  //   await mutateAsync(
  //     {
  //       poolIndex
  //     },
  //     {
  //       onSuccess(data) {
  //         console.log('data', data)
  //         if (data.result) {
  //           enqueueSnackbar(data.resultMessage)

  //           onRefetchData()
  //         }
  //         setLoading(false)
  //       },
  //       onError(err: string) {
  //         console.error('err', err)
  //         enqueueSnackbar(err)
  //         setLoading(false)
  //       }
  //     }
  //   )
  // }

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

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
            onShowRecenterDialog={handleChooseRecenter}
            onShowClosePositionDialog={handleShowClosePositionDialog}
          />
        )}
      </Box>
      <Stack direction='row' justifyContent='space-between' marginTop='9px'>
        {positions.length > 0 ?
          <AddButton onClick={redirectAddMultipoolPage}><Typography variant='p_sm'>+ New Liquidity Pool</Typography></AddButton>
          :
          <AddButtonNoPosition onClick={redirectAddMultipoolPage}><Typography variant='p_sm'>+ New Liquidity Pool</Typography></AddButtonNoPosition>
        }
        {/* <RecenterAllButton onClick={() => handleRecenterAll()}>Recenter all</RecenterAllButton> */}
      </Stack>

      {/* <AddPositionDialog
        open={openAddPosition}
        handleChoosePosition={handleChoosePosition}
        handleClose={() => setOpenAddPosition(false)}
      /> */}
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
        onRefetchData={onRefetchData}
        handleClose={() => setOpenEditLiquidity(false)}
      />
      <RecenterDialog
        open={openRecenter}
        positionIndex={editAssetId}
        poolIndex={poolIndex}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenRecenter(false)}
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

// const RecenterAllButton = styled(Button)`
//   width: 109px;
//   height: 26px;
//   padding: 1px 0;
//   font-size: 10px;
//   font-weight: 500;
//   color: #fff;
//   border-radius: 10px;
//   border: 1px solid transparent;
//   border-image-slice: 1;
//   background-image: linear-gradient(to bottom, #000, #000), linear-gradient(to bottom, #8c73ac 0%, #7d17ff 100%);
//   background-origin: border-box;
//   background-clip: content-box, border-box;
// `

export default LiquidityPositions