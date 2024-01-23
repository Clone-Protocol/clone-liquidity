import { Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import TradingComp from '~/components/Wrapper/TradingComp'
import dynamic from 'next/dynamic'

const TradingBox: React.FC = () => {
	const ChooseAssetDialog = dynamic(() => import('./Dialogs/ChooseAssetDialog'))
	const [openChooseAsset, setOpenChooseAsset] = useState(false)
	const [assetIndex, setAssetIndex] = useState(0)

	const handleChooseAsset = (assetId: number) => {
		setAssetIndex(assetId)
		setOpenChooseAsset(false)
	}

	return (
		<StyledPaper>
			<TradingComp
				assetIndex={assetIndex}
				onShowSearchAsset={() => setOpenChooseAsset(true)}
			/>

			<ChooseAssetDialog
				open={openChooseAsset}
				handleChooseAsset={handleChooseAsset}
				handleClose={() => setOpenChooseAsset(false)}
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

export default TradingBox
