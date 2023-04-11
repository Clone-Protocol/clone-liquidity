import { useState, MouseEventHandler } from 'react'
import Image from 'next/image'
import RecenterIconOff from 'public/images/iconsax-linear-forwarditem-off.svg'
import RecenterIconOn from 'public/images/iconsax-linear-forwarditem-on.svg'
import CloseIcon from 'public/images/close.svg'
import { Tooltip } from '@mui/material'

export const RecenterButton = ({ onClick }: { onClick: MouseEventHandler<HTMLImageElement> }) => {
	const [isHovering, setIsHovering] = useState(false)

	return (
		<Tooltip title="Recenter" arrow>
			<Image src={isHovering ? RecenterIconOn : RecenterIconOff} onClick={onClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} />
		</Tooltip>
	)
}

export const CloseButton = ({ onClick }: { onClick: MouseEventHandler<HTMLImageElement> }) => {
	return (
		<Tooltip placement="top" title="Close this Liquidity Position" arrow>
			<Image src={CloseIcon} onClick={onClick} />
		</Tooltip>
	)
}