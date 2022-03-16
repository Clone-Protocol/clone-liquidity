import { PriceChangeOutlined } from '@mui/icons-material'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

enum Asset {
	Euro,
	Gold,
	Solana,
	Ethereum,
	Bitcoin,
	Luna,
	Avalanche,
	Tesla,
	Apple,
	Amazon,
}

export const fetchCometDetail = async ({ program, userPubKey, index, cometIndex }: GetProps) => {
	if (!userPubKey) return

	await program.loadManager()
	const balances = await program.getPoolBalances(index)
	let price = balances[1] / balances[0]
	let tickerIcon = ''
	let tickerName = ''
	let tickerSymbol = ''
	let tightRange = price * 0.1
	let maxRange = 2 * price
	let centerPrice = price
	if (cometIndex != -1) {
		let comet = await program.getCometPosition(cometIndex)
		centerPrice = Number(comet.borrowedUsdi.val) / Number(comet.borrowedIasset.val)
	}
	switch (index) {
		case Asset.Euro:
			tickerName = 'iEuro'
			tickerSymbol = 'iEUR'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Gold:
			tickerName = 'iSPTSGD (GOLD INDEX)'
			tickerSymbol = 'iSPTSGD'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Solana:
			tickerName = 'iSolana'
			tickerSymbol = 'iSOL'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Ethereum:
			tickerName = 'iEthereum'
			tickerSymbol = 'iETH'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Bitcoin:
			tickerName = 'iBitcoin'
			tickerSymbol = 'iBTC'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Luna:
			tickerName = 'iLuna'
			tickerSymbol = 'iLUNA'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Avalanche:
			tickerName = 'iAvalanche'
			tickerSymbol = 'iAVAX'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Tesla:
			tickerName = 'iTesla'
			tickerSymbol = 'iTLSA'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Apple:
			tickerName = 'iApple'
			tickerSymbol = 'iAAPL'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Amazon:
			tickerName = 'iAmazon'
			tickerSymbol = 'iAMZN'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		default:
			throw new Error('Not supported')
	}
	return {
		tickerIcon: ethLogo,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		tightRange,
		maxRange,
		centerPrice
	}
}

interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
	index: number,
	cometIndex: number
}

export interface PositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string | null
	price: number
	isTight: boolean
	tightRange: number
	maxRange: number
	collAmount: number
	collRatio: number
	mintAmount: number
	lowerLimit: number
	centerPrice: number
	upperLimit: number
}
