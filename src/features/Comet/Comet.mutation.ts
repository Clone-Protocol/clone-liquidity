import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { useMutation } from 'react-query'
import { CloneClient, toDevnetScale } from "incept-protocol-sdk/sdk/src/clone"
import { recenterProcedureInstructions } from "incept-protocol-sdk/sdk/src/utils"
import { Comet, TokenData } from 'incept-protocol-sdk/sdk/src/interfaces'
import { toNumber, getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import * as anchor from '@coral-xyz/anchor'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getOnUSDAccount } from '~/utils/token_accounts';
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { TransactionStateType, useTransactionState } from "~/hooks/useTransactionState"
import { funcNoWallet } from '../baseQuery'
import { sendAndConfirm } from '~/utils/tx_helper';
import { getSinglePoolILD } from 'incept-protocol-sdk/sdk/src/healthscore'

export const callRecenter = async ({
  program,
  userPubKey,
  setTxState,
  data
}: CallRecenterProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('recenter data', data)

  await program.loadClone()

  const [tokenData, comet] = await Promise.all([
    program.getTokenData(), program.getSinglePoolComets()
  ]);
  const iassetMint = tokenData.pools[comet.positions[data.cometIndex].poolIndex].assetInfo.iassetMint
  let [usdiAddress, iassetAddress, usdiTreasuryAddress, iassetTreasuryAddress] = await Promise.all([
    getOnUSDAccount(program),
    getTokenAccount(
      iassetMint,
      userPubKey,
      program.provider.connection
    ),
    getTokenAccount(
      program.incept!.usdiMint,
      program.incept!.treasuryAddress,
      program.provider.connection
    ),
    getTokenAccount(
      iassetMint,
      program.incept!.treasuryAddress,
      program.provider.connection
    )
  ])

  let ixnCalls: Promise<TransactionInstruction>[] = [];

  if (usdiAddress === undefined) {
    const ata = await getAssociatedTokenAddress(program.incept!.usdiMint, userPubKey);
    ixnCalls.push(
      (async () => createAssociatedTokenAccountInstruction(userPubKey, ata, userPubKey, program.incept!.usdiMint))()
    )
    usdiAddress = ata
  }
  if (iassetAddress === undefined) {
    const ata = await getAssociatedTokenAddress(iassetMint, userPubKey);
    ixnCalls.push(
      (async () => createAssociatedTokenAccountInstruction(userPubKey, ata, userPubKey, iassetMint))()
    )
    iassetAddress = ata
  }
  if (usdiTreasuryAddress === undefined) {
    const ata = await getAssociatedTokenAddress(program.incept!.usdiMint, program.incept!.treasuryAddress);
    ixnCalls.push(
      (async () => createAssociatedTokenAccountInstruction(userPubKey, ata, program.incept!.treasuryAddress, program.incept!.usdiMint))()
    )
    usdiTreasuryAddress = ata
  }
  if (iassetTreasuryAddress === undefined) {
    const ata = await getAssociatedTokenAddress(program.incept!.usdiMint, program.incept!.treasuryAddress);
    ixnCalls.push(
      (async () => createAssociatedTokenAccountInstruction(userPubKey, ata, program.incept!.treasuryAddress, iassetMint))()
    )
    iassetTreasuryAddress = ata
  }

  const recenterData = recenterProcedureInstructions(
    program, comet, tokenData, data.cometIndex, usdiAddress!, iassetAddress!, usdiTreasuryAddress!, iassetTreasuryAddress!
  )

  recenterData.ixs.forEach((call) => ixnCalls.push(call))

  let ixns = await Promise.all(ixnCalls)

  const addressLookupTablesPublicKey = new PublicKey(process.env.NEXT_PUBLIC_INCEPT_ADDRESS_LOOKUP_TABLE!)

  await sendAndConfirm(program.provider, ixns, setTxState, [], [addressLookupTablesPublicKey])


  return {
    result: true
  }
}

type RecenterFormData = {
  cometIndex: number
}

interface CallRecenterProps {
  program: CloneClient
  userPubKey: PublicKey | null
  setTxState: (state: TransactionStateType) => void
  data: RecenterFormData
}

export function useRecenterMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { setTxState } = useTransactionState()
  const { getCloneApp } = useIncept()
  if (wallet) {
    return useMutation((data: RecenterFormData) => callRecenter({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
  } else {
    return useMutation((_: RecenterFormData) => funcNoWallet())
  }
}

const withdrawLiquidityAndPaySinglePoolCometILD = async ({ program, userPubKey, setTxState, data }: CallCloseProps, singlePoolComet: Comet, tokenData: TokenData, iassetMint: PublicKey, iassetAssociatedTokenAccount: PublicKey | undefined, usdiCollateralTokenAccount: PublicKey | undefined) => {

  let ixnsCalls: Promise<TransactionInstruction>[] = [program.updatePricesInstruction()];
  const iAssetAssociatedToken = await getAssociatedTokenAddress(
    iassetMint,
    program.provider.publicKey!,
  );
  if (iassetAssociatedTokenAccount === undefined) {
    ixnsCalls.push(
      (async () => createAssociatedTokenAccountInstruction(
        program.provider.publicKey!,
        iAssetAssociatedToken,
        program.provider.publicKey!,
        iassetMint
      ))()
    );
  }
  const usdiAssociatedToken = await getAssociatedTokenAddress(
    program.incept!.usdiMint,
    program.provider.publicKey!,
  );

  if (usdiCollateralTokenAccount === undefined) {
    ixnsCalls.push(
      (async () => createAssociatedTokenAccountInstruction(
        program.provider.publicKey!,
        usdiAssociatedToken,
        program.provider.publicKey!,
        program.incept!.usdiMint
      ))()
    );
  }

  if (getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue) !== 0) {
    ixnsCalls.push(
      program.withdrawLiquidityFromCometInstruction(
        new anchor.BN(getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue)),
        data.cometIndex,
        iAssetAssociatedToken, usdiAssociatedToken, true
      )
    );
  }

  let ildInfo = getSinglePoolILD(data.cometIndex, tokenData, singlePoolComet);

  if (ildInfo.usdiILD > 0) {
    ixnsCalls.push(
      program.payCometILDInstruction(
        data.cometIndex,
        getMantissa(singlePoolComet.positions[data.cometIndex].borrowedUsdi),
        true,
        iAssetAssociatedToken,
        usdiAssociatedToken,
        true
      ))
  }
  if (ildInfo.iAssetILD > 0) {
    ixnsCalls.push(
      program.payCometILDInstruction(
        data.cometIndex,
        getMantissa(singlePoolComet.positions[data.cometIndex].borrowedIasset),
        false,
        iAssetAssociatedToken,
        usdiAssociatedToken,
        true
      ))
  }

  const ixns = await Promise.all(ixnsCalls)

  await sendAndConfirm(program.provider, ixns, setTxState)
}

const withdrawCollateralAndCloseSinglePoolComet = async ({ program, userPubKey, setTxState, data }: CallCloseProps, singlePoolComet: Comet, usdiCollateralTokenAccount: PublicKey | undefined) => {
  let ixnCalls: Promise<TransactionInstruction>[] = [];

  const usdiAssociatedToken = await getAssociatedTokenAddress(
    program.incept!.usdiMint,
    userPubKey!,
  );

  if (usdiCollateralTokenAccount === undefined) {
    ixnCalls.push(
      (async () => createAssociatedTokenAccountInstruction(
        userPubKey!,
        usdiAssociatedToken,
        userPubKey!,
        program.incept!.usdiMint
      ))()
    )
  }

  const collateralAmount = toNumber(singlePoolComet.collaterals[data.cometIndex].collateralAmount);
  if (collateralAmount > 0) {
    ixnCalls.push(program.updatePricesInstruction());
    ixnCalls.push(
      program.withdrawCollateralFromSinglePoolCometInstruction(
        usdiAssociatedToken,
        toDevnetScale(collateralAmount),
        data.cometIndex
      )
    );
  }

  ixnCalls.push(
    program.closeSinglePoolCometInstruction(
      data.cometIndex
    )
  );

  const ixns = await Promise.all(ixnCalls);

  // program.provider.sendAndConfirm!(tx);
  await sendAndConfirm(program.provider, ixns, setTxState)
}


export const callClose = async ({ program, userPubKey, setTxState, data }: CallCloseProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('close input data', data)

  await program.loadClone()
  const tokenData = await program.getTokenData();

  let singlePoolComet = await program.getSinglePoolComets();
  let assetInfo = tokenData.pools[singlePoolComet.positions[data.cometIndex].poolIndex].assetInfo;

  const collateralAssociatedTokenAccount = await getOnUSDAccount(program);
  const iassetAssociatedTokenAccount = await getTokenAccount(assetInfo.iassetMint, userPubKey, program.connection);

  if (data.cType === 0) {
    if (Number(singlePoolComet.numPositions) !== 0) {
      await withdrawLiquidityAndPaySinglePoolCometILD(
        { program, userPubKey, setTxState, data }, singlePoolComet, tokenData, assetInfo.iassetMint, iassetAssociatedTokenAccount, collateralAssociatedTokenAccount
      )
    }

  } else {
    if (getMantissa(singlePoolComet.positions[data.cometIndex].liquidityTokenValue) === 0) {
      await withdrawCollateralAndCloseSinglePoolComet({ program, userPubKey, setTxState, data }, singlePoolComet, collateralAssociatedTokenAccount);
    }
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
  program: CloneClient
  userPubKey: PublicKey | null
  setTxState: (state: TransactionStateType) => void
  data: CloseFormData
}
export function useCloseMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useIncept()
  const { setTxState } = useTransactionState()

  if (wallet) {
    return useMutation((data: CloseFormData) => callClose({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
  } else {
    return useMutation((_: CloseFormData) => funcNoWallet())
  }
}

export const callEdit = async ({
  program,
  userPubKey,
  setTxState,
  data,
  setRefreshData
}: CallEditProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('edit input data', data)

  await program.loadClone()
  const tokenData = await program.getTokenData();

  const { collAmount, mintAmountChange, cometIndex, editType } = data
  const collateralAssociatedTokenAccount = await getOnUSDAccount(program);

  const singlePoolComet = await program.getSinglePoolComets();
  const poolIndex = Number(singlePoolComet.positions[cometIndex].poolIndex);
  const pool = tokenData.pools[poolIndex];
  const userIassetAta = await getAssociatedTokenAddress(pool.assetInfo.iassetMint, userPubKey)


  let ixnsCalls = [program.updatePricesInstruction()]

  let result = {
    result: false,
    msg: '',
    iassetMint: pool.assetInfo.iassetMint
  };

  if (collAmount != 0) {
    /// Deposit
    if (editType === 0) {
      ixnsCalls.push(
        program.addCollateralToSinglePoolCometInstruction(
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
      ixnsCalls.push(
        program.withdrawCollateralFromSinglePoolCometInstruction(
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

  // adjust onUSD & iAsset in liquidity
  if (mintAmountChange > 0) {
    ixnsCalls.push(
      program.addLiquidityToSinglePoolCometInstruction(
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
    ixnsCalls.push(
      program.withdrawLiquidityFromCometInstruction(
        new anchor.BN(lpTokensToClaim * 10 ** 8),
        cometIndex,
        userIassetAta,
        collateralAssociatedTokenAccount!,
        true
      )
    );
  }
  const ixns = await Promise.all(ixnsCalls)

  await sendAndConfirm(program.provider, ixns, setTxState)

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
  program: CloneClient
  userPubKey: PublicKey | null
  setTxState: (state: TransactionStateType) => void
  data: EditFormData,
  setRefreshData: () => void
}
export function useEditMutation(userPubKey: PublicKey | null, setRefreshData: () => void) {
  const wallet = useAnchorWallet()
  const { getCloneApp } = useIncept()
  const { setTxState } = useTransactionState()
  if (wallet) {
    return useMutation((data: EditFormData) => callEdit({ program: getCloneApp(wallet), userPubKey, setTxState, data, setRefreshData }))
  } else {
    return useMutation((_: EditFormData) => funcNoWallet())
  }
}

export const callComet = async ({
  program,
  userPubKey,
  setTxState,
  data
}: CallCometProps) => {
  if (!userPubKey) throw new Error('no user public key')

  console.log('comet input data', data)

  await program.loadClone()

  const { collateralAmount, usdiAmount, iassetIndex, collateralIndex } = data;
  const collateralAssociatedTokenAccount = await getOnUSDAccount(program);
  const singlePoolComets = await program.getSinglePoolComets();
  const newIndex = singlePoolComets.numPositions.toNumber();
  const ixnCalls = [
    program.updatePricesInstruction(),
    program.initializeSinglePoolCometInstruction(
      iassetIndex,
      collateralIndex
    ),
    program.addCollateralToSinglePoolCometInstruction(
      collateralAssociatedTokenAccount!,
      toDevnetScale(collateralAmount),
      collateralIndex,
      newIndex
    ),
    program.addLiquidityToSinglePoolCometInstruction(
      toDevnetScale(usdiAmount),
      newIndex,
      iassetIndex
    )
  ];

  let ixns = await Promise.all(ixnCalls)
  await sendAndConfirm(program.provider, ixns, setTxState)

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
  program: CloneClient
  userPubKey: PublicKey | null
  setTxState: (state: TransactionStateType) => void
  data: CometFormData
}

export function useCometMutation(userPubKey: PublicKey | null) {
  const wallet = useAnchorWallet()
  const { setTxState } = useTransactionState()
  const { getCloneApp } = useIncept()
  if (wallet) {
    return useMutation((data: CometFormData) => callComet({ program: getCloneApp(wallet), userPubKey, setTxState, data }))
  } else {
    return useMutation((_: CometFormData) => funcNoWallet())
  }
}

