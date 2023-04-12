import { useState, MouseEventHandler } from 'react'
import Image from 'next/image'
import RecenterIconOff from 'public/images/iconsax-linear-forwarditem-off.svg'
import RecenterIconOn from 'public/images/iconsax-linear-forwarditem-on.svg'
import CloseIcon from 'public/images/close.svg'
import { Tooltip, ButtonBase } from '@mui/material'

export const RecenterButton = ({ onClick }: { onClick: MouseEventHandler<HTMLImageElement> }) => {
	const [isHovering, setIsHovering] = useState(false)

	return (
		<Tooltip placement="bottom" title="Recenter" arrow>
			<ButtonBase>
				<Image src={isHovering ? RecenterIconOn : RecenterIconOff} onClick={onClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} />
			</ButtonBase>
		</Tooltip>
	)
}

export const CloseButton = ({ onClick }: { onClick: MouseEventHandler<HTMLImageElement> }) => {
	return (
		<Tooltip placement="bottom" title="Close this Liquidity Position" arrow>
			<ButtonBase>
				<Image src={CloseIcon} onClick={onClick} />
			</ButtonBase>
		</Tooltip>
	)
}