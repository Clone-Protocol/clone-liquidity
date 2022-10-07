import { PublicKey, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { useMutation } from 'react-query'
import { Incept, Comet } from "incept-protocol-sdk/sdk/src/incept"
import { toNumber, getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import * as anchor from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts';

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

const withdrawLiquidityAndPaySinglePoolCometILD = async ({program, userPubKey, data} : CallCloseProps, singlePoolComet: Comet, iassetAssociatedTokenAccount: PublicKey | undefined, usdiCollateralTokenAccount: PublicKey | undefined ) => {

  let tx = new Transaction();
  const iAssetAssociatedToken = await getAssociatedTokenAddress(
    data.iassetMint,
    program.provider.wallet.publicKey,
  );
  if (iassetAssociatedTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        program.provider.wallet.publicKey,
        iAssetAssociatedToken,
        program.provider.wallet.publicKey,
        data.iassetMint
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

  if (getMantissa(singlePoolComet.positions[0].liquidityTokenValue) !== 0) {
    tx.add(
      await program.withdrawLiquidityFromSinglePoolCometInstruction(
        new anchor.BN(getMantissa(singlePoolComet.positions[0].liquidityTokenValue)),
        data.cometIndex
      )
    );
  }

  tx.add(
    await program.paySinglePoolCometILDInstruction(
      data.cometIndex,
      getMantissa(singlePoolComet.collaterals[0].collateralAmount)
    )
  );

  await program.provider.send!(tx);
}

const withdrawCollateralAndCloseSinglePoolComet = async ({program, userPubKey, data} : CallCloseProps, singlePoolComet: Comet, usdiCollateralTokenAccount: PublicKey | undefined ) => {
  let tx = new Transaction();
  if (Number(singlePoolComet.numCollaterals) != 0) {
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
    tx.add(
      await program.withdrawCollateralFromSinglePoolCometInstruction(
        usdiAssociatedToken,
        new anchor.BN(getMantissa(singlePoolComet.collaterals[0].collateralAmount)),
        data.cometIndex
      )
    );
  }

  tx.add(
    await program.closeSinglePoolCometInstruction(
      data.cometIndex
    )
  );

  program.provider.send!(tx);
}


export const callClose = async ({program, userPubKey, data} : CallCloseProps) => {
	if (!userPubKey) throw new Error('no user public key')

  console.log('close input data', data)

	await program.loadManager()

  const collateralAssociatedTokenAccount = await getUSDiAccount(program);
  const iassetAssociatedTokenAccount = await getTokenAccount(data.iassetMint, userPubKey, program.connection);
  let singlePoolComet = await program.getSinglePoolComet(data.cometIndex);


  if (data.cType === 0) {
    if (Number(singlePoolComet.numPositions) !== 0) {
      await withdrawLiquidityAndPaySinglePoolCometILD(
        {program, userPubKey, data}, singlePoolComet, iassetAssociatedTokenAccount, collateralAssociatedTokenAccount
      )
    }

  } else {
    if (getMantissa(singlePoolComet.positions[0].liquidityTokenValue) === 0)  {
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

  const singlePoolComet = await program.getSinglePoolComet(cometIndex);
  const pool = await program.getPool(Number(singlePoolComet.positions[0].poolIndex));

  // adjust USDI & iAsset in liquidity
  if (mintAmountChange > 0) {
    await program.addLiquidityToSinglePoolComet(
      new anchor.BN(mintAmountChange * 10 ** 8),
      cometIndex,
      []
    )
  } else if (mintAmountChange < 0) {
    const lpTokensToClaim = Math.min(
      toNumber(pool.liquidityTokenSupply) * Math.abs(mintAmountChange) / toNumber(pool.usdiAmount),
      toNumber(singlePoolComet.positions[0].liquidityTokenValue)
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

  let tx = new Transaction();
  let signers = [];

  let userAccount = await program.getUserAccount();
  let singlePoolCometsAddress = userAccount.singlePoolComets;

  const singlePoolComets = await program.getSinglePoolComets();
  console.log("SPCS", singlePoolCometsAddress.toString())

  // Assume for now the single pool comets positions account is created,
  // Moving the creation to when we create a user account as transaction size is too large!
  // if (singlePoolCometsAddress.equals(PublicKey.default)) {
  //   const singlePoolCometsAccount = anchor.web3.Keypair.generate();
  //   singlePoolCometsAddress = singlePoolCometsAccount.publicKey;
  //   tx.add(
  //     await program.program.account.singlePoolComets.createInstruction(
  //       singlePoolCometsAccount
  //     )
  //   );
  //   tx.add(
  //     await program.initializeSinglePoolCometsInstruction(
  //       singlePoolCometsAccount
  //     )
  //   );
  //   signers.push(singlePoolCometsAccount);

  // } else {
  //   const singlePoolComets = await program.getSinglePoolComets();
  //   numberSinglePoolComets = Number(singlePoolComets.numComets);
  // }

  const newSinglePoolCometAccount = anchor.web3.Keypair.generate();
  signers.push(newSinglePoolCometAccount);
  tx.add(
       await program.program.account.comet.createInstruction(
          newSinglePoolCometAccount
       )
  );

  tx.add(
    await program.initializeSinglePoolCometInstruction(
      singlePoolCometsAddress, newSinglePoolCometAccount.publicKey, iassetIndex, 0
    )
  );

  tx.add(
    await program.updatePricesInstruction()
  );
  tx.add(
    await program.addCollateralToSinglePoolCometInstruction(
      collateralAssociatedTokenAccount!,
      new anchor.BN(collateralAmount * 10 ** 8),
      newSinglePoolCometAccount.publicKey,
      0
    )
  );
  tx.add(
    await program.addLiquidityToSinglePoolCometInstruction(
      new anchor.BN(usdiAmount * 10 ** 8),
      iassetIndex,
      newSinglePoolCometAccount.publicKey
    )
  );

  await program.provider.send!(tx, signers);

  // await program.openNewSinglePoolComet(
  //   collateralAssociatedTokenAccount!,
  //   new anchor.BN(usdiAmount * 10 ** 8),
  //   new anchor.BN(collateralAmount * 10 ** 8),
  //   iassetIndex,
	//   collateralIndex,
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

