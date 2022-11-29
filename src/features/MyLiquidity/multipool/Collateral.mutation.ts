import { PublicKey } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"


export const callEdit = async ({
	program,
	userPubKey,
	data
}: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('edit input data', data)

	await program.loadManager()

  // TODO: params need to be changed
  const { collAmount, mintAmountChange, cometIndex, editType } = data

  /// Deposit
  if (editType === 0) {

  /// Withdraw
  } else {

  }

}

type EditFormData = {
  cometIndex: number
	collAmount: number
  mintAmountChange: number
  editType: number
}
interface CallEditProps {
	program: Incept
	userPubKey: PublicKey | null
  data: EditFormData
}
export function useCollateralMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(), userPubKey, data }))
}
