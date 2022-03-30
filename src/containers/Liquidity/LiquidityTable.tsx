import { Box, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { FilterType, FilterTypeMap } from '~/features/MyLiquidity/CometPools.query'
import GridComet from '~/containers/Liquidity/comet/GridComet'
import GridUnconcentrated from '~/containers/Liquidity/unconcentrated/GridUnconcentrated'
import GridBorrow from '~/containers/Liquidity/borrow/GridBorrow'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import { TabPanel, StyledTabs, StyledTab } from '~/components/Common/StyledTab'

const LiquidityTable = () => {
	const [tab, setTab] = useState(0)
	const [filter, setFilter] = useState<FilterType>('all')

	// useEffect(() => {
	// 	const program = getInceptApp()

	// 	async function fetch() {
	// 		const data1 = await fetchCometPools({
	// 			program,
	// 			userPubKey: publicKey,
	// 			filter,
	// 		})
	// 		console.log(data1)
	// 		setCometPools(data1)

	// 		const data2 = await fetchUnconcentPools({
	// 			program,
	// 			userPubKey: publicKey,
	// 			filter,
	// 		})
	// 		setUnconcentPools(data2)

	// 		const data3 = await fetchBorrowAssets({
	// 			program,
	// 			userPubKey: publicKey,
	// 			filter,
	// 		})
	// 		setBorrowAssets(data3)
	// 		console.log(data3)
	// 	}
	// 	fetch()
	// }, [publicKey])

	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

	return (
		<Box
			sx={{
				background: '#171717',
				color: '#fff',
				'& .super-app-theme--header': { color: '#9d9d9d', fontSize: '13px' },
				'& .super-app-theme--row': { border: 'solid 1px #535353' },
				'& .super-app-theme--cell': { borderBottom: 'solid 1px #535353' },
			}}>
			<StyledTabs value={tab} onChange={handleChangeTab}>
				<StyledTab value={0} label="Comet" />
				<StyledTab value={1} label="Unconcentrated" />
				<StyledTab value={2} label="Borrow" />
			</StyledTabs>

			<Stack mt={4} mb={2} direction="row" justifyContent="space-between">
				<PageTabs value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
					))}
				</PageTabs>
			</Stack>
			<TabPanel value={tab} index={0}>
        <GridComet filter={filter} />
			</TabPanel>
			<TabPanel value={tab} index={1}>
				<GridUnconcentrated filter={filter} />
			</TabPanel>
			<TabPanel value={tab} index={2}>
				<GridBorrow filter={filter} />
			</TabPanel>
		</Box>
	)
}

export default LiquidityTable
