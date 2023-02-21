import { PublicKey, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { useMutation } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { Comet } from 'incept-protocol-sdk/sdk/src/interfaces'
import { toNumber, getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import * as anchor from '@project-serum/anchor'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts';
import { useAnchorWallet } from '@solana/wallet-adapter-react'

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
  program: InceptClient
  userPubKey: PublicKey | null
  data: RecenterFormData
}

export function useRecenterMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  if (wallet) {
    return useMutation((data: RecenterFormData) => callRecenter({ program: getInceptApp(wallet), userPubKey, data }))
  } else {
    throw new Error('no wallet')
  }
}

const withdrawLiquidityAndPaySinglePoolCometILD = async ({ program, userPubKey, data }: CallCloseProps, singlePoolComet: Comet, iassetMint: PublicKey, iassetAssociatedTokenAccount: PublicKey | undefined, usdiCollateralTokenAccount: PublicKey | undefined) => {

  let tx = new Transaction();
  const iAssetAssociatedToken = await getAssociatedTokenAddress(
    iassetMint,
    program.provider.publicKey!,
  );
  if (iassetAssociatedTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        program.provider.publicKey!,
        iAssetAssociatedToken,
        program.provider.publicKey!,
        iassetMint
      )
    );
  }
  const usdiAssociatedToken = await getAssociatedTokenAddress(
    program.incept!.usdiMint,
    program.provider.publicKey!,
  );

  if (usdiCollateralTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        program.provider.publicKey!,
        usdiAssociatedToken,
        program.provider.publicKey!,
        program.incept!.usdiMint
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

  let payILDInstruction = await program.paySinglePoolCometILDInstruction(
    data.cometIndex,
    getMantissa(singlePoolComet.collaterals[data.cometIndex].collateralAmount)
  );

  tx.add(
    payILDInstruction
  ).add(
    payILDInstruction
  );

  await program.provider.send!(tx);
}

const withdrawCollateralAndCloseSinglePoolComet = async ({ program, userPubKey, data }: CallCloseProps, singlePoolComet: Comet, usdiCollateralTokenAccount: PublicKey | undefined) => {
  let tx = new Transaction();

  const usdiAssociatedToken = await getAssociatedTokenAddress(
    program.incept!.usdiMint,
    userPubKey!,
  );

  if (usdiCollateralTokenAccount === undefined) {
    tx.add(
      await createAssociatedTokenAccountInstruction(
        userPubKey!,
        usdiAssociatedToken,
        userPubKey!,
        program.incept!.usdiMint
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


export const callClose = async ({ program, userPubKey, data }: CallCloseProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('close input data', data)

  await program.loadManager()
  const tokenData = await program.getTokenData();

  let singlePoolComet = await program.getSinglePoolComets();
  let assetInfo = tokenData.pools[singlePoolComet.positions[data.cometIndex].poolIndex].assetInfo;

  const collateralAssociatedTokenAccount = await getUSDiAccount(program);
  const iassetAssociatedTokenAccount = await getTokenAccount(assetInfo.iassetMint, userPubKey, program.connection);

  if (data.cType === 0) {
    if (Number(singlePoolComet.numPositions) !== 0) {
      await withdrawLiquidityAndPaySinglePoolCometILD(
        { program, userPubKey, data }, singlePoolComet, assetInfo.iassetMint, iassetAssociatedTokenAccount, collateralAssociatedTokenAccount
      )
    }

  } else {
    if (getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue) === 0) {
      await withdrawCollateralAndCloseSinglePoolComet({ program, userPubKey, data }, singlePoolComet, collateralAssociatedTokenAccount);
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
  program: InceptClient
  userPubKey: PublicKey | null
  data: CloseFormData
}
export function useCloseMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  if (wallet) {
    return useMutation((data: CloseFormData) => callClose({ program: getInceptApp(wallet), userPubKey, data }))
  } else {
    throw new Error('no wallet')
  }
}

export const callEdit = async ({
  program,
  userPubKey,
  data,
  setRefreshData
}: CallEditProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('edit input data', data)

  await program.loadManager()
  const tokenData = await program.getTokenData();

  const { collAmount, mintAmountChange, cometIndex, editType } = data
  const collateralAssociatedTokenAccount = await getUSDiAccount(program);

  const singlePoolComet = await program.getSinglePoolComets();
  const poolIndex = Number(singlePoolComet.positions[cometIndex].poolIndex);
  const pool = tokenData.pools[poolIndex];

  let tx = new Transaction().add(
    await program.updatePricesInstruction()
  );

  let result = {
    result: false,
    msg: '',
    iassetMint: pool.assetInfo.iassetMint
  };

  if (collAmount != 0) {
    /// Deposit
    if (editType === 0) {
      tx.add(
        await program.addCollateralToSinglePoolCometInstruction(
          collateralAssociatedTokenAccount!,
          new anchor.BN(collAmount * 10 ** 8),
          0,
          cometIndex
        )
      );

      result = {
        result: true,
        msg: 'added collateral to comet',
        iassetMint: pool.assetInfo.iassetMint
      };
    } else {
      /// Withdraw
      tx.add(
        await program.withdrawCollateralFromSinglePoolCometInstruction(
          collateralAssociatedTokenAccount!,
          new anchor.BN(collAmount * 10 ** 8),
          cometIndex,
        )
      );

      result = {
        result: true,
        msg: 'withdraw collateral from comet',
        iassetMint: pool.assetInfo.iassetMint
      }
    }
  }

  // adjust USDI & iAsset in liquidity
  if (mintAmountChange > 0) {
    tx.add(
      await program.addLiquidityToSinglePoolCometInstruction(
        new anchor.BN(mintAmountChange * 10 ** 8),
        cometIndex,
        poolIndex
      )
    );
  } else if (mintAmountChange < 0) {
    const lpTokensToClaim = Math.min(
      toNumber(pool.liquidityTokenSupply) * Math.abs(mintAmountChange) / toNumber(pool.usdiAmount),
      toNumber(singlePoolComet.positions[cometIndex].liquidityTokenValue)
    )
    tx.add(
      await program.withdrawLiquidityFromSinglePoolCometInstruction(
        new anchor.BN(lpTokensToClaim * 10 ** 8),
        cometIndex,
      )
    );
  }
  await program.provider.send!(tx);

  setRefreshData();

  return result;
}

type EditFormData = {
  cometIndex: number
  collAmount: number
  mintAmountChange: number
  editType: number
}
interface CallEditProps {
  program: InceptClient
  userPubKey: PublicKey | null
  data: EditFormData,
  setRefreshData: () => {}
}
export function useEditMutation(userPubKey: PublicKey | null, setRefreshData: () => {}) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  if (wallet) {
    return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(wallet), userPubKey, data, setRefreshData }))
  } else {
    throw new Error('no wallet')
  }
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
  program: InceptClient
  userPubKey: PublicKey | null
  data: CometFormData
}

export function useCometMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  if (wallet) {
    return useMutation((data: CometFormData) => callComet({ program: getInceptApp(wallet), userPubKey, data }))
  } else {
    throw new Error('no wallet')
  }
}

