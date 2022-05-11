import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { toScaledNumber } from 'incept-protocol-sdk/sdk/src/utils'
import { BN } from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'

export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('close input data', data)

	await program.loadManager()

	let comet = await program.getCometPosition(data.cometIndex)
	let pool = await program.getPool(comet.poolIndex)

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(pool.assetInfo.iassetMint)
	const usdiAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	await program.closeComet(
		collateralAssociatedTokenAccount.address,
		iassetAssociatedTokenAccount.address,
		usdiAssociatedTokenAccount.address,
		data.cometIndex,
		[]
	)

  return {
    result: true
  }
}

type CloseFormData = {
  cometIndex: number,
}
interface CallCloseProps {
	program: Incept
	userPubKey: PublicKey | null
  data: CloseFormData
}
export function useCloseMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(), userPubKey, data }))
}

export const callEdit = async ({
	program,
	userPubKey,
	data
}: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('edit input data', data)

	await program.loadManager()

  const { totalCollateralAmount, cometIndex } = data
	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	let comet = await program.getCometPosition(cometIndex)

	if (totalCollateralAmount > toScaledNumber(comet.collateralAmount)) {
		await program.addCollateralToComet(
			collateralAssociatedTokenAccount.address,
			new BN(totalCollateralAmount * 10 ** 8).sub(comet.collateralAmount.val),
			cometIndex,
			[]
		)

    return {
      result: true,
      msg: 'added collateral to comet'
    }
	} else if (totalCollateralAmount < toScaledNumber(comet.collateralAmount)) {
		await program.withdrawCollateralFromComet(
			collateralAssociatedTokenAccount.address,
			comet.collateralAmount.val.sub(new BN(totalCollateralAmount * 10 ** 8)),
			cometIndex,
			[]
		)

    return {
      result: true,
      msg: 'withdraw collateral from comet'
    }
	}

  return {
    result : false
  }
}

type EditFormData = {
  cometIndex: number,
	totalCollateralAmount: number
}
interface CallEditProps {
	program: Incept
	userPubKey: PublicKey | null
  data: EditFormData
}
export function useEditMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(), userPubKey, data }))
}



export const callComet = async ({
	program,
	userPubKey,
	data
}: CallCometProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('comet input data', data)

	await program.loadManager()

  const { collateralAmount, usdiAmount, iassetIndex, collateralIndex } = data
	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	await program.initializeComet(
		collateralAssociatedTokenAccount.address,
		new BN(collateralAmount * 10 ** 8),
		new BN(usdiAmount * 10 ** 8),
		iassetIndex,
		collateralIndex,
		[]
	)

  return {
    result: true
  }
}

type CometFormData = {
  collateralIndex: number
	iassetIndex: number
	collateralAmount: number
	usdiAmount: number
}

interface CallCometProps {
	program: Incept
	userPubKey: PublicKey | null
  data: CometFormData
}

export function useCometMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: CometFormData) => callComet({ program: getInceptApp(), userPubKey, data }))
}
