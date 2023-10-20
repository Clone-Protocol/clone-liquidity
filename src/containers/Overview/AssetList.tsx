import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState, useCallback } from 'react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useAssetsQuery } from '~/features/Overview/Assets.query'
import { FilterType, FilterTypeMap } from '~/data/filter'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import ArrowUpward from 'public/images/arrow-upward.svg'
import ArrowDownward from 'public/images/arrow-down-red.svg'
import { Grid, CellTicker } from '~/components/Common/DataGrid'
import SearchInput from '~/components/Overview/SearchInput'
import useDebounce from '~/hooks/useDebounce'
import { GridEventListener } from '@mui/x-data-grid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { useRouter } from 'next/navigation'
import { formatDollarAmount } from '~/utils/numbers'

const AssetList: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('all')
	const [searchTerm, setSearchTerm] = useState('')
	const debounceSearchTerm = useDebounce(searchTerm, 500)
	const router = useRouter()

	const { data: assets } = useAssetsQuery({
		filter,
		searchTerm: debounceSearchTerm ? debounceSearchTerm : '',
		refetchOnMount: true,
		enabled: true
	})

	const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

	const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setSearchTerm(newVal)
		} else {
			setSearchTerm('')
		}
	}, [searchTerm])

	// const isAlreadyInitializedAccount = useAtomValue(isAlreadyInitializedAccountState)
	// const handleLinkNeedingAccountClick = useOnLinkNeedingAccountClick()

	const handleRowClick: GridEventListener<'rowClick'> = (
		params
	) => {
		// if (isAlreadyInitializedAccount) {
		router.push(`/comet/assets/${params.row.ticker}`)
		// } else {
		// 	handleLinkNeedingAccountClick(undefined)
		// }
	}

	return (
		<PanelBox>
			<Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
				<PageTabs value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
					))}
				</PageTabs>
				<SearchInput onChange={handleSearch} />
			</Stack>
			<Grid
				headers={columns}
				rows={assets || []}
				minHeight={110}
				hasTopBorderRadius={true}
				customNoRowsOverlay={() => CustomNoRowsOverlay('No assets')}
				onRowClick={handleRowClick}
			/>
		</PanelBox>
	)
}

let columns: GridColDef[] = [
	{
		field: 'iAsset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'onAsset Pools',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
			)
		},
	},
	{
		field: 'price',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Price (devUSD)',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Typography variant='p_xlg'>${params.value?.toLocaleString()}</Typography>
		},
	},
	{
		field: '24hChange',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Change',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return params.row.change24h >= 0 ?
				<Box color='#4fe5ff' display='flex' alignItems='center'>
					<Typography variant='p_xlg'>+{params.row.change24h.toFixed(2)}%</Typography>
					<Image src={ArrowUpward} alt='arrowUp' />
				</Box>
				: <Box color='#ff0084' display='flex' alignItems='center'>
					<Typography variant='p_xlg'>{params.row.change24h.toFixed(2)}%</Typography>
					<Image src={ArrowDownward} alt='arrowDown' />
				</Box>
		},
	},
	{
		field: 'liquidity',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Typography variant='p_xlg'>{formatDollarAmount(Number(params.value), 3)}</Typography>
		},
	},
	{
		field: '24hVolume',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Volume',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Typography variant='p_xlg'>{formatDollarAmount(Number(params.row.volume24h), 3)}</Typography>
		},
	},
	{
		field: 'avgAPY24h',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'APY',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return params.row.avgAPY24h >= 0 ?
				<Box color='#4fe5ff' display='flex' alignItems='center'>
					<Typography variant='p_xlg'>+{params.row.avgAPY24h.toFixed(2)}%</Typography>
					<Image src={ArrowUpward} alt='arrowUp' />
				</Box>
				: <Box color='#ff0084' display='flex' alignItems='center'>
					<Typography variant='p_xlg'>{params.row.avgAPY24h.toFixed(2)}%</Typography>
					<Image src={ArrowDownward} alt='arrowDown' />
				</Box>
		},
	},
	// {
	// 	field: 'action',
	// 	headerClassName: 'super-app-theme--header',
	// 	cellClassName: 'last--cell',
	// 	headerName: '',
	// 	flex: 1,
	// 	renderCell(params: GridRenderCellParams<string>) {
	// 		const goToTrading = (e: any) => {
	// 			e.stopPropagation()
	// 			const url = `${MARKETS_APP}/trade/${params.row.ticker}`
	// 			window.open(url)
	// 		}

	// 		return (
	// 			<TradeButton onClick={goToTrading}>
	// 				<Image src={TradeIcon} alt='trade' />
	// 			</TradeButton>
	// 		)
	// 	},
	// },
]

const PanelBox = styled(Box)`
	padding: 18px 36px;
  color: #fff;
  & .super-app-theme--header { 
    color: #9d9d9d; 
    font-size: 11px; 
  }
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(AssetList, <LoadingProgress />)
