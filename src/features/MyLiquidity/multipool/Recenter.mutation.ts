import { PublicKey } from '@solana/web3.js'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { useMutation } from 'react-query'
import { useIncept } from '~/hooks/useIncept'

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
