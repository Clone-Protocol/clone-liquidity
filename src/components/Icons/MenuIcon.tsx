import { SvgIcon, SvgIconProps } from '@mui/material'

const MenuIcon = (props: SvgIconProps) => {
	return (
		<SvgIcon {...props} sx={{ fill: 'none', width: '24px', height: '24px' }} viewBox="0 0 24 24">
			<rect x="2" y="4" width="20" height="2" fill="white" />
			<rect x="2" y="11" width="20" height="2" fill="white" />
			<rect x="2" y="18" width="20" height="2" fill="white" />
		</SvgIcon>
	)
}

export default MenuIcon
