import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"
import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

enum Asset {
	Solana,
	Ethereum,
}

export const fetchCometDetail = async ({ program, userPubKey, index }: GetProps) => {
  if (!userPubKey) return 

	await program.loadManager()
	const balances = await program.getPoolBalances(index)
  let price = balances[1] / balances[0]
	let tickerIcon = ''
	let tickerName = ''
	let tickerSymbol = ''
	switch (index) {
		case Asset.Solana:
			tickerIcon = ethLogo
			tickerName = 'iSolana'
			tickerSymbol = 'iSOL'
			break
		case Asset.Ethereum:
			tickerIcon = ethLogo
			tickerName = 'iEthereum'
			tickerSymbol = 'iETH'
			break
		default:
			throw new Error('Not supported')
	}
	return {
		tickerIcon: ethLogo,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		aPrice: price,
	}
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
  index: number
}

export interface PositionInfo {
  tickerIcon: string,
  tickerName: string,
  tickerSymbol: string | null,
  aPrice: number,
}