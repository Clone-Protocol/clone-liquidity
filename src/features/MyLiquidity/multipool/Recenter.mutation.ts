import { PublicKey, Transaction } from '@solana/web3.js'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { useMutation } from 'react-query'
import { assetMapping } from '~/data/assets'
import { useIncept } from '~/hooks/useIncept'

export const callRecenterAll = async ({ program, userPubKey, data }: CallRecenterProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('recenter data', data)

	await program.loadManager()

	const [cometResult, tokenDataResult] = await Promise.allSettled([program.getComet(), program.getTokenData()])

	if (cometResult.status === 'rejected' || tokenDataResult.status === 'rejected') {
		return {
			result: false,
		}
	}

	const comet = cometResult.value
	const tokenData = tokenDataResult.value

	let calls = []
  let tickers = []
	const tickCutoff = 0.01

	for (let i = 0; i < Number(comet.numPositions); i++) {
		let position = comet.positions[i]
		let pool = tokenData.pools[Number(position.poolIndex)]
		let initPrice = toNumber(position.borrowedUsdi) / toNumber(position.borrowedIasset)
		let poolPrice = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
    const {tickerName, ..._} = assetMapping(Number(position.poolIndex))
		if (Math.abs(initPrice - poolPrice) >= tickCutoff) {
			calls.push(program.recenterCometInstruction(i, 0, false))
      tickers.push(tickerName)
		}
	}

  if (calls.length === 0) {
    return {
      result: false
    }
  }
	let tx = new Transaction()

	Promise.all(calls).then((ixs) => {
		for (let ix of ixs) {
			tx.add(ix)
		}
	})

	await program.provider.send!(tx)

	// @TODO: Call to recenterAll
	// await program.recenterComet(
	// 	poolIndex,
	// 	[]
	// )

	return {
    tickers,
		result: true,
	}
}

export function useRecenterAllMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: RecenterFormData) => callRecenterAll({ program: getInceptApp(), userPubKey, data }))
}

export const callRecenter = async ({ program, userPubKey, data }: CallRecenterProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('recenter data', data)

	await program.loadManager()

	// @TODO: Call to recenterMultiPoolComet
	await program.recenterComet(data.positionIndex, 0, false)

	return {
		result: true,
	}
}

type RecenterFormData = {
	positionIndex: number
}

interface CallRecenterProps {
	program: Incept
	userPubKey: PublicKey | null
	data: RecenterFormData
}

export function useRecenterMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: RecenterFormData) => callRecenter({ program: getInceptApp(), userPubKey, data }))
}
