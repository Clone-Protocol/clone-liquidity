import { PublicKey, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { useMutation } from 'react-query'
import { Incept, Comet } from "incept-protocol-sdk/sdk/src/incept"
import { toNumber, getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import * as anchor from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts';
import { sleep } from 'react-query/types/core/utils';

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

const withdrawLiquidityAndPaySinglePoolCometILD = async ({program, userPubKey, data} : CallCloseProps, singlePoolComet: Comet, iassetMint: PublicKey, iassetAssociatedTokenAccount: PublicKey | undefined, usdiCollateralTokenAccount: PublicKey | undefined ) => {

  let tx = new Transaction();
  const iAssetAssociatedToken = await getAssociatedTokenAddress(
    iassetMint,
    program.provider.wallet.publicKey,
  );
  if (iassetAssociatedTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        program.provider.wallet.publicKey,
        iAssetAssociatedToken,
        program.provider.wallet.publicKey,
        iassetMint
      )
    );
  }
  const usdiAssociatedToken = await getAssociatedTokenAddress(
    program.manager!.usdiMint,
    program.provider.wallet.publicKey,
  );

  if (usdiCollateralTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        program.provider.wallet.publicKey,
        usdiAssociatedToken,
        program.provider.wallet.publicKey,
        program.manager!.usdiMint
      )
    );
  }

  if (getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue) !== 0) {
    tx.add(
      await program.withdrawLiquidityFromSinglePoolCometInstruction(
        new anchor.BN(getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue)),
        data.cometIndex
      )
    );
  }

  tx.add(
    await program.paySinglePoolCometILDInstruction(
      data.cometIndex,
      getMantissa(singlePoolComet.collaterals[data.cometIndex].collateralAmount)
    )
  );

  await program.provider.send!(tx);
}

const withdrawCollateralAndCloseSinglePoolComet = async ({program, userPubKey, data} : CallCloseProps, singlePoolComet: Comet, usdiCollateralTokenAccount: PublicKey | undefined ) => {
  let tx = new Transaction();

  const usdiAssociatedToken = await getAssociatedTokenAddress(
    program.manager!.usdiMint,
    userPubKey!,
  );

  if (usdiCollateralTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        userPubKey!,
        usdiAssociatedToken,
        userPubKey!,
        program.manager!.usdiMint
      )
    );
  }

  let collateralAmount = getMantissa(singlePoolComet.collaterals[data.cometIndex].collateralAmount);
  if (collateralAmount > 0) {
    tx.add(await program.updatePricesInstruction());
    tx.add(
      await program.withdrawCollateralFromSinglePoolCometInstruction(
        usdiAssociatedToken,
        new anchor.BN(collateralAmount),
        data.cometIndex
      )
    );
  }

  tx.add(
    await program.closeSinglePoolCometInstruction(
      data.cometIndex
    )
  );

  await program.provider.send!(tx);
}


export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('close input data', data)

	await program.loadManager()

  let singlePoolComet = await program.getSinglePoolComets();
  let assetInfo = await program.getAssetInfo(singlePoolComet.positions[data.cometIndex].poolIndex);

  const collateralAssociatedTokenAccount = await getUSDiAccount(program);
  const iassetAssociatedTokenAccount = await getTokenAccount(assetInfo.iassetMint, userPubKey, program.connection);

  if (data.cType === 0) {
    if (Number(singlePoolComet.numPositions) !== 0) {
      await withdrawLiquidityAndPaySinglePoolCometILD(
        {program, userPubKey, data}, singlePoolComet, assetInfo.iassetMint, iassetAssociatedTokenAccount, collateralAssociatedTokenAccount
      )
    }

  } else {
    if (getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue) === 0)  {
      await withdrawCollateralAndCloseSinglePoolComet({program, userPubKey, data}, singlePoolComet, collateralAssociatedTokenAccount);
    }
  }
  
  return {
    result: true
  }
}

type CloseFormData = {
  cometIndex: number,
  cType: number, // 0 : withdraw liquidity , 1 : close comet
  iassetMint: PublicKey
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
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);

  const singlePoolComet = await program.getSinglePoolComets();
  const poolIndex = Number(singlePoolComet.positions[cometIndex].poolIndex);
  const pool = await program.getPool(poolIndex);

  // adjust USDI & iAsset in liquidity
  if (mintAmountChange > 0) {
    await program.addLiquidityToSinglePoolComet(
      new anchor.BN(mintAmountChange * 10 ** 8),
      cometIndex,
      poolIndex
    )
  } else if (mintAmountChange < 0) {
    const lpTokensToClaim = Math.min(
      toNumber(pool.liquidityTokenSupply) * Math.abs(mintAmountChange) / toNumber(pool.usdiAmount),
      toNumber(singlePoolComet.positions[cometIndex].liquidityTokenValue)
    )
    await program.withdrawLiquidityFromSinglePoolComet(
      new anchor.BN(lpTokensToClaim * 10 ** 8),
      cometIndex,
      []
    )
  }

  /// Deposit
  if (editType === 0) {
		await program.addCollateralToSinglePoolComet(
			collateralAssociatedTokenAccount!,
			new anchor.BN(collAmount * 10 ** 8),
			cometIndex
		)

    return {
      result: true,
      msg: 'added collateral to comet',
      iassetMint: pool.assetInfo.iassetMint
    }
	} else { 
  /// Withdraw
		await program.withdrawCollateralFromSinglePoolComet(
			collateralAssociatedTokenAccount!,
			new anchor.BN(collAmount * 10 ** 8),
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

  const { collateralAmount, usdiAmount, iassetIndex, collateralIndex } = data;
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);

  await program.openNewSinglePoolComet(
    collateralAssociatedTokenAccount!,
    new anchor.BN(usdiAmount * 10 ** 8),
    new anchor.BN(collateralAmount * 10 ** 8),
    iassetIndex,
    collateralIndex
  );

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

