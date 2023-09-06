import { Box, Stack, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { GridColDef, GridEventListener, GridRenderCellParams } from '@mui/x-data-grid'
import { Grid, CellTicker, CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import LiquidityPairView from '~/components/Liquidity/comet/LiquidityPairView'
import { LiquidityPosition } from '~/features/MyLiquidity/comet/CometInfo.query'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AddIcon from 'public/images/add-icon.svg'
import Image from 'next/image'

const LiquidityPositions = ({ positions, onRefetchData }: { positions: LiquidityPosition[], onRefetchData: () => void }) => {
  const router = useRouter()
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

  const handleRowClick: GridEventListener<'rowClick'> = (
    params
  ) => {
    // if (isAlreadyInitializedAccount) {
    // 	router.push(`/assets/${params.row.ticker}`)
    // } else {
    // 	handleLinkNeedingAccountClick(undefined)
    // }
  }

  const rowsPositions = positions.map((position, id) => ({
    ...position,
    id,
  }))

  return (
    <>
      <Box>
        <Grid
          headers={columns}
          rows={rowsPositions || []}
          minHeight={120}
          customNoRowsOverlay={() => CustomNoRowsOverlay('Please connect wallet.')}
          onRowClick={handleRowClick}
        />
        {/* <PairHeader>
          <Box><Typography variant="p_sm">Pool</Typography></Box>
          <Box ml='120px'><Typography variant="p_sm">Liquidity Value</Typography></Box>
          <Box ml='15px'><Typography variant="p_sm">ILD</Typography></Box>
          <Box ml='-5px'><Typography variant="p_sm">Rewards</Typography></Box>
          <Box></Box>
        </PairHeader> */}
        {positions.map((position, index) =>
          <LiquidityPairView
            key={index}
            poolIndex={index}
            tickerIcon={position.tickerIcon}
            tickerSymbol={position.tickerSymbol}
            value={position.liquidityDollarPrice}
            ildInUsdi={position.ildInUsdi}
            ildValue={position.ildValue}
            rewards={position.rewards}
            onShowEditDialog={handleChooseEditPosition}
            onShowClosePositionDialog={handleShowClosePositionDialog}
          />
        )}
      </Box>
      <Stack direction='row' justifyContent='space-between' marginTop='9px'>
        {positions.length > 0 ?
          <AddButton onClick={redirectAddCometPage}><Image src={AddIcon} width={15} height={15} alt='add' /><Typography variant='p_lg' ml='10px'>Add new liquidity position</Typography></AddButton>
          :
          <AddButtonNoPosition onClick={redirectAddCometPage}><Image src={AddIcon} width={15} height={15} alt='add' /><Typography variant='p_lg' ml='10px'>Add new liquidity position</Typography></AddButtonNoPosition>
        }
      </Stack>

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

let columns: GridColDef[] = [
  {
    field: 'pool',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Liquidity Pool',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
      )
    },
  },
  {
    field: 'liquidityAmount',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Liquidity Amount',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.liquidityDollarPrice.toLocaleString()}</Typography>
    },
  },
  {
    field: 'ild',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'ILD',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.ildValue.toLocaleString()}</Typography>
    },
  },
  {
    field: 'rewards',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Rewards',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.rewards.toLocaleString()}</Typography>
    },
  },
  {
    field: 'pnl',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'P/L',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>+3.47%</Typography>
    },
  },
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

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
  background-color: rgba(255, 255, 255, 0.01);
  border: 1px solid ${(props) => props.theme.basis.jurassicGrey};
  color: ${(props) => props.theme.basis.shadowGloom};
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