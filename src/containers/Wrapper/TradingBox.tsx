import { Box, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import TradingComp from '~/components/Wrapper/TradingComp'
import dynamic from 'next/dynamic'
import WrapBridgeDialog from '~/components/Wrapper/WrapBridgeDialog'
import { ARB_Widget, OP_Widget } from '~/utils/debridge_widgets'
import { AssetTickers } from '~/data/assets'
import TradingComp1M from '~/components/Wrapper/TradingComp1M'
import { InfoMsg } from '~/components/Common/WarningMsg'
import { StyledTabs, StyledTab } from "~/components/Common/StyledTab"

const TradingBox: React.FC = () => {
	const ChooseAssetDialog = dynamic(() => import('./Dialogs/ChooseAssetDialog'))
	const [openChooseAsset, setOpenChooseAsset] = useState(false)
	const [assetIndex, setAssetIndex] = useState(0)
	const [openWrapBridge, setOpenWrapBridge] = useState(false)
	const [widgetType, setWidgetType] = useState(ARB_Widget)
	const [tab, setTab] = useState(0)

	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	const handleChooseAsset = (assetId: number) => {
		setAssetIndex(assetId)
		setOpenChooseAsset(false)

		if (assetId === AssetTickers.arbitrum) {
			setWidgetType(ARB_Widget)
		} else if (assetId === AssetTickers.optimism) {
			setWidgetType(OP_Widget)
		}
	}

	return (
		<StyledPaper>
			<Box sx={{ backgroundColor: '#1a1c28', borderRadius: '10px' }}>
				<StyledTabs value={tab} onChange={handleChangeTab}>
					<StyledTab value={0} label="clAsset Wrapper" width='180px' allBorderRadius={true} />
					<StyledTab value={1} label="1M Wrapper" width='180px' allBorderRadius={true} />
				</StyledTabs>
			</Box>

			<Box mt='21px'>
				<InfoMsg>
					{tab === 0 ? 'clAsset Wrapper lets users mint clAssets by wrapping bridged assets, enabling arbitrage on Clone.' : '1M Wrapper lets users convert tokens into 1M tokens at a 1:1,000,000 ratio.'}
				</InfoMsg>
			</Box>
			<Divider />

			{tab === 0 ?
				<TradingComp
					assetIndex={assetIndex}
					onShowSearchAsset={() => setOpenChooseAsset(true)}
					onShowWrapBridge={() => setOpenWrapBridge(true)}
				/>
				:
				<TradingComp1M
					assetIndex={assetIndex}
					onShowSearchAsset={() => setOpenChooseAsset(true)}
					onShowWrapBridge={() => setOpenWrapBridge(true)}
				/>
			}

			<ChooseAssetDialog
				open={openChooseAsset}
				handleChooseAsset={handleChooseAsset}
				handleClose={() => setOpenChooseAsset(false)}
			/>

			<WrapBridgeDialog
				open={openWrapBridge}
				widgetType={widgetType}
				handleClose={() => setOpenWrapBridge(false)}
			/>
		</StyledPaper>
	)
}

const StyledPaper = styled(Paper)`
  position: relative;
	width: 360px;
	background: transparent;
	text-align: center;
`
const Divider = styled(Box)`
	width: 100%;
	height: 1px;
	background: #414e66;
	margin-top: 22px;
	margin-bottom: 22px;
`

export default TradingBox
