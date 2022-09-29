import { PublicKey } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";
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

  await program.recenterSinglePoolComet(
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

  if (data.cType === 0) {
    // Withdraw liquidity & pay ILD
    await program.withdrawLiquidityAndPaySinglePoolCometILD(
      data.cometIndex,
      []
    )
  } else {
    const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
    //Close comet & withdraw collateral
    await program.withdrawCollateralAndCloseSinglePoolComet(
      collateralAssociatedTokenAccount.address,
      data.cometIndex,
      []
    )
  }
  
  return {
    result: true
  }
}

type CloseFormData = {
  cometIndex: number,
  cType: number, // 0 : withdraw liquidity , 1 : close comet
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

  const { collAmount, mintAmountChange, cometIndex, editType } = data
	const collateralAssociatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()

  const singlePoolComet = await program.getSinglePoolComet(cometIndex);
  const pool = await program.getPool(Number(singlePoolComet.positions[0].poolIndex));

  // adjust USDI & iAsset in liquidity
  if (mintAmountChange > 0) {
    await program.addLiquidityToSinglePoolComet(
      new BN(mintAmountChange * 10 ** 8),
      cometIndex,
      []
    )
  } else if (mintAmountChange < 0) {
    const lpTokensToClaim = Math.min(
      toNumber(pool.liquidityTokenSupply) * Math.abs(mintAmountChange) / toNumber(pool.usdiAmount),
      toNumber(singlePoolComet.positions[0].liquidityTokenValue)
    )
    await program.withdrawLiquidityFromSinglePoolComet(
      new BN(lpTokensToClaim * 10 ** 8),
      cometIndex,
      []
    )
  }

  /// Deposit
  if (editType === 0) {
		await program.addCollateralToSinglePoolComet(
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

