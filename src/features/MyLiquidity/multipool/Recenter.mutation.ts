import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useMutation } from 'react-query'
import { useIncept } from '~/hooks/useIncept'

export const callRecenterAll = async ({
  program,
  userPubKey,
	data
}: CallRecenterProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('recenter data', data)

  const { poolIndex } = data

  await program.loadManager()

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

  const { poolIndex } = data

  await program.loadManager()

  // @TODO: Call to recenterMultiPoolComet
  // await program.recenterComet(
	// 	poolIndex,
	// 	[]
	// )

  return {
    result: true
  }
}

type RecenterFormData = {
  poolIndex: number
}

interface CallRecenterProps {
	program: Incept
	userPubKey: PublicKey | null
  data: RecenterFormData
}

export function useRecenterMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: RecenterFormData) => callRecenter({ program: getInceptApp(), userPubKey, data }))
}