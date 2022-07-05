import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { BN } from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'


export const callRecenter = async ({
  program,
  userPubKey,
	data
}: CallRecenterProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('recenter data', data)

  await program.loadManager()

//   const multiPoolComet = await program.getComet()
//   let comet = multiPoolComet.positions[data.cometIndex]
  let comet = await program.getSinglePoolComet(data.cometIndex);
  let position = comet.positions[0];
	let pool = await program.getPool(position.poolIndex)

  const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(pool.assetInfo.iassetMint)

  await program.recenterSinglePoolComet(
		iassetAssociatedTokenAccount.address,
		data.cometIndex,
		[]
	)

  return {
    result: true
  }
}

type RecenterFormData = {
  cometIndex: number
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


export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('close input data', data)

	await program.loadManager()

//   const multiPoolComet = await program.getComet()
//   let comet = multiPoolComet.positions[data.cometIndex]
	let comet = await program.getSinglePoolComet(data.cometIndex);
	let position = comet.positions[0];
	let pool = await program.getPool(position.poolIndex)

	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
	const iassetAssociatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(pool.assetInfo.iassetMint)
	const usdiAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

	// await program.closeComet(
	// 	collateralAssociatedTokenAccount.address,
	// 	iassetAssociatedTokenAccount.address,
	// 	usdiAssociatedTokenAccount.address,
	// 	data.cometIndex,
	// 	[]
	// )

  await program.closeComet(
		iassetAssociatedTokenAccount.address,
		usdiAssociatedTokenAccount.address,
		data.cometIndex,
    false,
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

  const { collAmount, cometIndex, editType } = data
	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

  const multiPoolComet = await program.getSinglePoolComet(cometIndex);//getComet()
  let comet = multiPoolComet.positions[cometIndex]

  /// Deposit
	// if (totalCollateralAmount > toScaledNumber(comet.collateralAmount)) {
  if (editType === 0) {
		await program.addCollateralToSinglePoolCometInstruction(
			collateralAssociatedTokenAccount.address,
			new BN(collAmount * 10 ** 8),
			cometIndex
		)

    return {
      result: true,
      msg: 'added collateral to comet'
    }
	} else { 
  /// Withdraw
  // else if (totalCollateralAmount < toScaledNumber(comet.collateralAmount)) {
		await program.withdrawCollateralFromSinglePoolComet(
			collateralAssociatedTokenAccount.address,
			new BN(collAmount * 10 ** 8),
			cometIndex,
			[]
		)

    return {
      result: true,
      msg: 'withdraw collateral from comet'
    }
	}
}

type EditFormData = {
  cometIndex: number,
	collAmount: number
  editType: number
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

  await program.openNewSinglePoolComet(
    collateralAssociatedTokenAccount.address,
    new BN(usdiAmount * 10 ** 8),
    new BN(collateralAmount * 10 ** 8),
    iassetIndex,
	collateralIndex,
		[]
  )

	// await program.initializeComet(
	// 	collateralAssociatedTokenAccount.address,
	// 	new BN(collateralAmount * 10 ** 8),
	// 	new BN(usdiAmount * 10 ** 8),
	// 	iassetIndex,
	// 	collateralIndex,
	// 	[]
	// )

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

