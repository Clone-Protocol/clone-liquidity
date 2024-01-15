import { Box, Stack, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useEffect, useState } from 'react'
import { GridColDef, GridEventListener, GridRenderCellParams } from '@mui/x-data-grid'
import { Grid, CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { LiquidityPosition } from '~/features/MyLiquidity/comet/CometInfo.query'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AddIconOn from 'public/images/add-icon-on.svg'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { AddIcon } from '~/components/Common/SvgIcons'
import { ON_USD } from '~/utils/constants'
import { PoolStatusButton, showPoolStatus } from '~/components/Common/PoolStatus'
import { Status } from 'clone-protocol-sdk/sdk/generated/clone'
import { DEFAULT_ASSET_LINK } from '~/data/assets'

const LiquidityPositions = ({ hasNoCollateral, positions, onRefetchData }: { hasNoCollateral: boolean, positions: LiquidityPosition[], onRefetchData: () => void }) => {
  const router = useRouter()
  const { publicKey } = useWallet()
  const [openEditLiquidity, setOpenEditLiquidity] = useState(false)
  const [editAssetId, setEditAssetId] = useState(0)
  const [poolIndex, setPoolIndex] = useState(0)
  const [isBtnHover, setIsBtnHover] = useState(false)
  const [renderPositions, setRenderPositions] = useState<LiquidityPosition[]>([])
  const EditLiquidityDialog = dynamic(() => import('./Dialogs/EditLiquidityDialog'))

  useEffect(() => {
    if (positions) {
      setRenderPositions(positions)
    }
  }, [positions])

  const handleChooseEditPosition = (positionIndex: number) => {
    console.log('positions', renderPositions)
    console.log('positionIndex', positionIndex)
    setPoolIndex(Number(renderPositions[positionIndex].poolIndex))
    setEditAssetId(positionIndex)
    setOpenEditLiquidity(true)
  }

  const redirectAddCometPage = () => {
    router.push(DEFAULT_ASSET_LINK)
  }

  const handleRowClick: GridEventListener<'rowClick'> = (
    params
  ) => {
    if (params.row.status !== Status.Frozen) {
      handleChooseEditPosition(params.row.positionIndex)
    }
  }

  const rowsPositions = renderPositions.map((position, id) => ({
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
          minHeight={108}
          noAutoHeight={(!publicKey || hasNoCollateral || (!hasNoCollateral && positions.length === 0)) === true}
          customNoRowsOverlay={customOverlay}
          onRowClick={handleRowClick}
        />
      </Box>
      {publicKey && !hasNoCollateral &&
        <Stack direction='row' mt='9px' onMouseOver={() => setIsBtnHover(true)} onMouseLeave={() => setIsBtnHover(false)}>
          {positions.length > 0 ?
            <AddButton onClick={redirectAddCometPage} disableRipple>
              <Stack direction='row'>
                <AddIcon color={isBtnHover ? '#fff' : '#414e66'} />
                <Typography variant='p_lg' ml='10px' color={isBtnHover ? '#fff' : '#414e66'}>Add new liquidity position</Typography>
              </Stack>
            </AddButton>
            :
            <AddButtonNoPosition onClick={redirectAddCometPage}>
              <Image src={AddIconOn} width={15} height={15} alt='add' />
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
          onRefetchData={onRefetchData}
          handleClose={() => setOpenEditLiquidity(false)}
        />
      }
    </>
  )

}

let columns: GridColDef[] = [
  {
    field: 'pool',
    headerClassName: '',
    cellClassName: '',
    headerName: 'Liquidity Pool',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <Box display="flex" justifyContent="flex-start">
          <Image src={params.row.tickerIcon} width={27} height={27} alt={params.row.tickerSymbol} />
          <Box ml='10px'><Typography variant='p_xlg'>{params.row.tickerSymbol}{'/'}{ON_USD}</Typography></Box>
        </Box>
      )
    },
  },
  {
    field: 'liquidityAmount',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: 'Liquidity Amount',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.liquidityDollarPrice.toLocaleString()}</Typography>
    },
  },
  {
    field: 'ild',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: 'ILD',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.ildValue.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
    },
  },
  {
    field: 'rewards',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: 'Rewards',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.rewards.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
    },
  },
  {
    field: 'apy',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: 'APY',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return showPoolStatus(params.row.status) ? <PoolStatusButton status={params.row.status} />
        :
        Number(params.value) >= 0 ?
          <Box display='flex' justifyContent='center' alignItems='center' color='#4fe5ff'>
            <Typography variant='p_xlg'>+{Number(params.value).toFixed(2)}%</Typography>
          </Box>
          :
          <Box display='flex' alignItems='center' color='#ff0084'>
            <Typography variant='p_xlg'>-{Number(params.value).toFixed(2)}%</Typography>
          </Box>
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
  }
`
const AddButtonNoPosition = styled(AddButton)`
  height: 70px;
  color: #fff;
  border: 0px;
  margin-top: -80px;
  &:hover {
    border-color: ${(props) => props.theme.palette.info.main};
  }
`

export default LiquidityPositions