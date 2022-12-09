import { PublicKey, Transaction } from '@solana/web3.js'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { useMutation } from 'react-query'
import { useIncept } from '~/hooks/useIncept'

export const callRecenterAll = async ({
  program,
  userPubKey,
	data
}: CallRecenterProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('recenter data', data)

  await program.loadManager()

  const comet = await program.getComet()

  let calls = []

  for (let i=0; i<Number(comet.numPositions); i++) {
    calls.push(program.recenterCometInstruction(i, 0, false))
  }

  let tx = new Transaction();

  Promise.all(calls).then(ixs => {
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
    result: true
  }
}

export function useRecenterAllMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: RecenterFormData) => callRecenterAll({ program: getInceptApp(), userPubKey, data }))
}

export const callRecenter = async ({
  program,
  userPubKey,
	data
}: CallRecenterProps) => {
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
