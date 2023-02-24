import { styled, Typography, Box } from '@mui/material'
import { useState } from 'react'

const DisabledCloseCometWarningMsg = () => {
	const [showWhyPanel, setShowWhyPanel] = useState(false)

	return (
		<BoxWithBorder>
			<Box><Typography variant='p_sm' color='#989898'>iAsset data view is disabled for second step of Close Comet action.</Typography></Box>
			<Box mt='15px'>
				<Box sx={{ cursor: 'pointer' }} onClick={() => setShowWhyPanel(!showWhyPanel)}><Typography variant='p_sm'>Why?</Typography></Box>
				{showWhyPanel && <Box mt='10px' lineHeight={1} textAlign='left'><Typography variant='p_sm'>We are unable to produce the iAsset data view for this comet because all of the liquidity has been withdrawn from the position. Withdraw your collateral to finish closing your comet.</Typography></Box>}
			</Box>
		</BoxWithBorder >
	)
}

const BoxWithBorder = styled(Box)`
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	padding: 20px;
	text-align: center;
`

export default DisabledCloseCometWarningMsg
