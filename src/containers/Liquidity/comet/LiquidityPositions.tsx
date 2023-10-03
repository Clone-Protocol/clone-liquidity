import { Box, Stack, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { GridColDef, GridEventListener, GridRenderCellParams } from '@mui/x-data-grid'
import { Grid, CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { LiquidityPosition } from '~/features/MyLiquidity/comet/CometInfo.query'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AddIcon from 'public/images/add-icon.svg'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import ArrowUpward from 'public/images/arrow-upward.svg'
import ArrowDownward from 'public/images/arrow-downward.svg'

const LiquidityPositions = ({ hasNoCollateral, positions, onRefetchData }: { hasNoCollateral: boolean, positions: LiquidityPosition[], onRefetchData: () => void }) => {
  const router = useRouter()
  const { publicKey } = useWallet()
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
    router.push(`/comet/assets/euro`)
  }

  const handleRowClick: GridEventListener<'rowClick'> = (
    params
  ) => {
    handleChooseEditPosition(params.row.id)
  }

  const rowsPositions = positions.map((position, id) => ({
    ...position,
    id,
  }))

  let customOverlay = () => CustomNoRowsOverlay('')
  if (!publicKey) {
    customOverlay = () => CustomNoRowsOverlay('Please connect wallet.')
  } else if (hasNoCollateral) {
    customOverlay = () => CustomNoRowsOverlay('Please add collateral first to initiate liquidity positions.', '#fff')
  }

  return (
    <>
      <Box>
        <Grid
          headers={columns}
          rows={rowsPositions || []}
          minHeight={120}
          customNoRowsOverlay={customOverlay}
          onRowClick={handleRowClick}
        />
        {/* {positions.map((position, index) =>
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
        )} */}
      </Box>
      {publicKey && !hasNoCollateral &&
        <Stack direction='row' mt='9px'>
          {positions.length > 0 ?
            <AddButton onClick={redirectAddCometPage}>
              <Image src={AddIcon} width={15} height={15} alt='add' />
              <Typography variant='p_lg' ml='10px'>Add new liquidity position</Typography>
            </AddButton>
            :
            <AddButtonNoPosition onClick={redirectAddCometPage}>
              <Image src={AddIcon} width={15} height={15} alt='add' />
              <Typography variant='p_lg' ml='10px'>Add new liquidity position</Typography>
            </AddButtonNoPosition>
          }
        </Stack>
      }

      {openEditLiquidity &&
        <EditLiquidityDialog
          open={openEditLiquidity}
          positionIndex={editAssetId}
          poolIndex={poolIndex}
          onShowCloseLiquidity={handleShowCloseLiquidityDialog}
          onRefetchData={onRefetchData}
          handleClose={() => setOpenEditLiquidity(false)}
        />
      }
      {openClosePosition &&
        <CloseLiquidityDialog
          open={openClosePosition}
          positionIndex={editAssetId}
          poolIndex={poolIndex}
          onRefetchData={onRefetchData}
          handleClose={() => setOpenClosePosition(false)}
        />
      }
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
        <Box display="flex" justifyContent="flex-start">
          <Image src={params.row.tickerIcon} width={27} height={27} alt={params.row.tickerSymbol} />
          <Box ml='10px'><Typography variant='p_xlg'>{params.row.tickerSymbol}{'/devUSD'}</Typography></Box>
        </Box>
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
    field: 'apy',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'APY',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Box display='flex' justifyContent='center' alignItems='center' color='#4fe5ff'>
        <Typography variant='p_xlg'>+3.47%</Typography>
        <Image src={ArrowUpward} alt='arrowUp' />
      </Box>
      // <Box display='flex' alignItems='center' color='#ff0084'>
      //   <Typography variant='p_xlg'>-3.47%</Typography>
      //   <Image src={ArrowDownward} alt='arrowDown' />
      // </Box>
    },
  },
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

const AddButton = styled(Button)`
  width: 100%;
  height: 28px;
  padding: 4px 0;
  background-color: rgba(255, 255, 255, 0.01);
  border: 1px solid ${(props) => props.theme.basis.jurassicGrey};
  color: ${(props) => props.theme.basis.shadowGloom};
  margin-top: 9px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
`
const AddButtonNoPosition = styled(AddButton)`
  height: 42px;
  color: #fff;
  &:hover {
    border-color: ${(props) => props.theme.palette.info.main};
  }
`

export default LiquidityPositions