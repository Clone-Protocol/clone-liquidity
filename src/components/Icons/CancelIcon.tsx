import { SvgIcon, SvgIconProps } from '@mui/material'

const CancelIcon = (props: SvgIconProps) => {
	let color: string
	switch (props.color) {
		case 'info':
			color = 'white'
			break

		default:
			color = '#7B7982'
			break
	}
	return (
		<SvgIcon {...props} sx={{ fill: 'none', width: '16px', height: '16px' }} viewBox="0 0 16 16">
			<path
				d="M14.6666 1.33398L1.33325 14.6673"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M1.33325 1.33398L14.6666 14.6673"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	)
}

export default CancelIcon
