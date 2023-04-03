import { useState, MouseEventHandler } from 'react'
import Image from 'next/image'
import RecenterIconOff from 'public/images/iconsax-linear-forwarditem-off.svg'
import RecenterIconOn from 'public/images/iconsax-linear-forwarditem-on.svg'

export const RecenterButton = ({ onClick }: { onClick: MouseEventHandler<HTMLImageElement> }) => {
	const [isHovering, setIsHovering] = useState(false)

	return (
		<Image src={isHovering ? RecenterIconOn : RecenterIconOff} onClick={onClick} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} />
	)
}