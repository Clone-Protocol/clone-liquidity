import React from 'react'
import { Stack, Typography, Button, Box } from '@mui/material'
import { styled } from '@mui/system'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker, GridType } from '~/components/Common/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useBorrowQuery } from '~/features/MyLiquidity/Borrow.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { GridEventListener } from '@mui/x-data-grid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AddIcon from 'public/images/add-icon.svg'
import BorrowLiquidityStatus from './BorrowLiquidityStatus'

const BorrowPositions = () => {
	const { publicKey } = useWallet()
	const router = useRouter()

	const { data: positions } = useBorrowQuery({
		userPubKey: publicKey,
		filter: 'all',
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const handleRowClick: GridEventListener<'rowClick'> = (
		params,
	) => {
		router.push(`/borrow/myliquidity/${params.row.id}`)
	}

	const moveNewBorrowPositionPage = () => {
		router.push('/borrow')
	}

	return (
		<>
			<Typography variant='h3' fontWeight={500} mb='20px'>Borrow</Typography>
			<BorrowLiquidityStatus />

			<Grid
				headers={columns}
				rows={positions || []}
				minHeight={120}
				hasRangeIndicator={true}
				gridType={GridType.Borrow}
				customNoRowsOverlay={() => CustomNoRowsOverlay('Please connect wallet')}
				onRowClick={handleRowClick}
			/>

			{publicKey &&
				<Stack direction='row' mt='9px'>
					{positions && positions.length > 0 ?
						<AddButton onClick={moveNewBorrowPositionPage}>
							<Image src={AddIcon} width={15} height={15} alt='add' />
							<Typography variant='p_lg' ml='10px'>Add new borrow position</Typography>
						</AddButton>
						:
						<AddButtonNoPosition onClick={() => { }}>
							<Image src={AddIcon} width={15} height={15} alt='add' />
							<Typography variant='p_lg' ml='10px'>Add new borrow position</Typography>
						</AddButtonNoPosition>
					}
				</Stack>
			}
		</>
	)
}

let columns: GridColDef[] = [
	{
		field: 'asset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'onAsset',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
			)
		},
	},
	{
		field: 'borrowed',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Borrowed',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Stack direction='column' alignItems='flex-end'>
					<Box><CellDigitValue value={params.value} symbol={params.row.tickerSymbol} /></Box>
					<Box><Typography variant='p_xlg' color='#66707e'>${params.value?.toLocaleString()} USD</Typography></Box>
				</Stack>
			)
		},
	},
	{
		field: 'collateral',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Stack direction='column' alignItems='flex-end'>
					<Box><CellDigitValue value={params.value} symbol="devUSD" /></Box>
					<Box><Typography variant='p_xlg' color='#66707e'>${params.value?.toLocaleString()} USD</Typography></Box>
				</Stack>
			)
		},
	},
	{
		field: 'collateralRatio',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral Ratio',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const isRisk = params.row.collateralRatio - params.row.minCollateralRatio < 20
			return params.row.borrowed > 0 ?
				(<Stack direction='column' alignItems='flex-end'>
					<Box><Typography variant='h4' color={isRisk ? '#ed2525' : '#4fe5ff'}>{params.value?.toLocaleString()}%</Typography></Box>
					<Box><Typography variant='p_xlg' color={isRisk ? '#ed2525' : '#66707e'}>(min {params.row.minCollateralRatio.toLocaleString()}%)</Typography></Box>
				</Stack>)
				: (<></>)
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


export default withSuspense(BorrowPositions, <LoadingProgress />)
