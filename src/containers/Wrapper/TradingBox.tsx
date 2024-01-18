import { Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import TradingComp from '~/components/Wrapper/TradingComp'
import { useRouter } from 'next/navigation'
import { ASSETS } from '~/data/assets'

interface Props {
	assetId: number
}

const TradingBox: React.FC<Props> = ({ assetId }) => {
	// const router = useRouter()
	const [showSearchAssetDlog, setShowSearchAssetDlog] = useState(false)
	const assetIndex = assetId

	const chooseAsset = (id: number) => {
		setShowSearchAssetDlog(false)
		// router.push(`/trade/${ASSETS[id].ticker}`)
	}

	return (
		<StyledPaper>
			<TradingComp
				assetIndex={assetIndex}
				onShowSearchAsset={() => setShowSearchAssetDlog(true)}
			/>

			{/* <SearchAssetDialog
				open={showSearchAssetDlog}
				onChooseAsset={(id) => chooseAsset(id)}
				onHide={() => setShowSearchAssetDlog(false)}
			/> */}
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
