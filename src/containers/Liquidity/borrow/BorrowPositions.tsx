import React, { useCallback, useState } from 'react'
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
import AddIconOn from 'public/images/add-icon-on.svg'
import { AddIcon } from '~/components/Common/SvgIcons'
import BorrowLiquidityStatus from './BorrowLiquidityStatus'
import { ON_USD } from '~/utils/constants'
import { PoolStatusButton, showPoolStatus } from '~/components/Common/PoolStatus'
import { Status } from 'clone-protocol-sdk/sdk/generated/clone'

const BorrowPositions = () => {
	const { publicKey } = useWallet()
	const router = useRouter()
	const [isBtnHover, setIsBtnHover] = useState(false)

	const { data: positions } = useBorrowQuery({
		userPubKey: publicKey,
		filter: 'all',
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const handleRowClick: GridEventListener<'rowClick'> = (
		params,
	) => {
		if (params.row.status !== Status.Frozen) {
			router.push(`/borrow/myliquidity/${params.row.id}`)
		}
	}

	const moveNewBorrowPositionPage = () => {
		router.push('/borrow')
	}

	let customOverlayMsg = ''
	if (!publicKey) {
		customOverlayMsg = 'Please connect wallet.'
	}

	return (
		<>
			<Typography variant='h3' fontWeight={500} mb='20px'>Borrow</Typography>
			<BorrowLiquidityStatus hasNoPosition={positions && positions.length > 0 ? false : true} />

			<Grid
				headers={columns}
				rows={positions || []}
				minHeight={108}
				noAutoHeight={(!publicKey || positions?.length === 0) === true}
				hasRangeIndicator={true}
				hasTopBorderRadius={true}
				gridType={GridType.Borrow}
				customNoRowsOverlay={() => CustomNoRowsOverlay(customOverlayMsg)}
				onRowClick={handleRowClick}
			/>

			{publicKey &&
				<Stack direction='row' mt='9px' onMouseOver={() => setIsBtnHover(true)} onMouseLeave={() => setIsBtnHover(false)}>
					{positions && positions.length > 0 ?
						<AddButton onClick={moveNewBorrowPositionPage} sx={isBtnHover ? { color: '#fff' } : { color: '#414e66' }} disableRipple>
							<Stack direction='row'>
								<AddIcon color={isBtnHover ? '#fff' : '#414e66'} />
								<Typography variant='p_lg' ml='10px' color={isBtnHover ? '#fff' : '#414e66'}>Add new borrow position</Typography>
							</Stack>
						</AddButton>
						:
						<AddButtonNoPosition onClick={moveNewBorrowPositionPage}>
							<Image src={AddIconOn} width={15} height={15} alt='add' />
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
		headerClassName: '',
		cellClassName: '',
		headerName: 'clAsset',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return params.row.borrowed > 0 ?
				<CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
				: <Box><Typography variant='p_xlg' color='#989898'>Please continue to close</Typography></Box>
		},
	},
	{
		field: 'borrowed',
		headerClassName: 'right--header',
		cellClassName: 'right--cell',
		headerName: 'Borrowed',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return Number(params.value) > 0 ?
				<Stack direction='column' alignItems='flex-end'>
					<Box><CellDigitValue value={params.value} symbol={params.row.tickerSymbol} /></Box>
					<Box><Typography variant='p_lg' color='#66707e'>${(Number(params.value) * params.row.oPrice).toLocaleString(undefined, { maximumFractionDigits: 5 })} USD</Typography></Box>
				</Stack>
				: <Box></Box>
		},
	},
	{
		field: 'collateral',
		headerClassName: 'right--header',
		cellClassName: 'right--cell',
		headerName: 'Collateral',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Stack direction='column' alignItems='flex-end'>
					<Box><CellDigitValue value={params.value} symbol={ON_USD} /></Box>
					<Box><Typography variant='p_lg' color='#66707e'>${params.value?.toLocaleString()} USD</Typography></Box>
				</Stack>
			)
		},
	},
	{
		field: 'collateralRatio',
		headerClassName: 'right--header',
		cellClassName: 'right--cell',
		headerName: 'Collateral Ratio',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const isRisk = params.row.collateralRatio - params.row.minCollateralRatio < 20
			return showPoolStatus(params.row.status) ? <PoolStatusButton status={params.row.status} />
				:
				params.row.borrowed > 0 ?
					(<Stack direction='column' alignItems='flex-end'>
						<Box><Typography variant='h4' color={isRisk ? '#ed2525' : '#4fe5ff'}>{params.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</Typography></Box>
						<Box><Typography variant='p_lg' color={isRisk ? '#ed2525' : '#66707e'}>(min {params.row.minCollateralRatio.toLocaleString()}%)</Typography></Box>
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


export default withSuspense(BorrowPositions, <LoadingProgress />)
