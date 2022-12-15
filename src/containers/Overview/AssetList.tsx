import { Box, Stack } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState, useCallback } from 'react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useAssetsQuery } from '~/features/Overview/Assets.query'
import { FilterType, FilterTypeMap } from '~/data/filter'
import Divider from '@mui/material/Divider';
import Link from 'next/link'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import TradeIcon from 'public/images/trade-icon.svg'
import ChangePositionIcon from 'public/images/change-position-icon.svg'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import SearchInput from '~/components/Overview/SearchInput'
import useDebounce from '~/hooks/useDebounce'
import { useGlobalState } from '~/hooks/useGlobalState'
import { ConfirmModalState } from '~/utils/constants'

const AssetList: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const debounceSearchTerm = useDebounce(searchTerm, 500)

	const { data: assets } = useAssetsQuery({
    filter,
    searchTerm: debounceSearchTerm ? debounceSearchTerm : '',
	  refetchOnMount: "always",
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

	

	return (
		<Box
			sx={{
				background: 'rgba(21, 22, 24, 0.75)',
				color: '#fff',
        padding: '18px 36px',
        borderRadius: '10px',
        '& .super-app-theme--header': { color: '#9d9d9d', fontSize: '11px' },
			}}>
			<Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
				<PageTabs value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
					))}
				</PageTabs>
        <SearchInput onChange={handleSearch} />
			</Stack>
      <Divider sx={{ backgroundColor: '#535353' }} />
      <Grid
        headers={columns}
				rows={assets || []}
				minHeight={680}
      />
		</Box>
	)
}

let columns: GridColDef[] = [
	{
		field: 'iAsset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'iAsset',
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
		headerName: 'Price',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'liquidity',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: '24hVolume',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Volume',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.row.volume24h} symbol="USDi" />
		},
	},
	{
		field: 'baselineAPY',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Fee Revenue',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.row.baselineAPY} symbol="USDi" />
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const { globalState, setGlobalState } = useGlobalState()

			const handleClick = (evt: any) => {
				if (!globalState.declinedAccountCreation) {
					return
				}
				setGlobalState({
					...globalState,
					createAccountModalState: ConfirmModalState.Reminder
				})
				evt.preventDefault()
			}
			
			return (
        <Stack direction="row" spacing={1}>
          <Link href={`/assets/${params.row.id}/asset`} onClick={handleClick}>
            <ChangePositionButton>
              <Image src={ChangePositionIcon} onClick={handleClick} />
            </ChangePositionButton>
          </Link>
          <Link href={`/assets/${params.row.id}/asset?ltab=1`}>
            <TradeButton>
              <Image src={TradeIcon} />
            </TradeButton>
          </Link>
        </Stack>
			)
		},
	},
]

const ChangePositionButton = styled(Box)`
	width: 25px;
	height: 25px;
	flex-grow: 0;
	padding: 6px;
  line-height: 10px;
	border-radius: 4px;
	border: solid 1px #535353;
  background-color: #1b377b;
	cursor: pointer;
	&:hover {
		border-color: #809CFF;
	}
`

const TradeButton = styled(Box)`
	width: 25px;
	height: 25px;
	flex-grow: 0;
	padding: 2px 4px 4px 7px;
	border-radius: 4px;
	border: solid 1px #535353;
	cursor: pointer;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(AssetList, <LoadingProgress />)
