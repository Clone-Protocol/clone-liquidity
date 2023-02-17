import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import * as anchor from "@project-serum/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"

export const callWithdraw = async ({program, userPubKey, data} : CallWithdrawProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  	const { index, percent } = data
	const tokenData = await program.getTokenData();

	let fractionClaimable = percent / 100;

	let liquidityPositions = await program.getLiquidityPositions();
	let liquidityPosition = liquidityPositions[index]!;

	let liquidityTokenAmount = liquidityPosition.liquidityTokens * fractionClaimable;

	let iassetMint = tokenData.pools[liquidityPosition.poolIndex].assetInfo.iassetMint
	let liquidityTokenMint = tokenData.pools[liquidityPosition.poolIndex].liquidityTokenMint

	let iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	let collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	let tx = new Transaction();
	
	if (iassetAssociatedTokenAccount === undefined) {
		const iAssetAssociatedToken: PublicKey = await getAssociatedTokenAddress(
			iassetMint,
			program.provider.publicKey!,
			);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				iAssetAssociatedToken,
				program.provider.publicKey!,
				iassetMint
			)
		);
		iassetAssociatedTokenAccount = iAssetAssociatedToken;
	}
	if (collateralAssociatedTokenAccount === undefined) {
		const usdiAssociatedToken = await getAssociatedTokenAddress(
			program.incept!.usdiMint,
			program.provider.publicKey!,
			);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				usdiAssociatedToken,
				program.provider.publicKey!,
				program.incept!.usdiMint
			)
		);
		collateralAssociatedTokenAccount = usdiAssociatedToken;
	}

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.publicKey!,
			);
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				liquidityAssociatedToken,
				program.provider.publicKey!,
				liquidityTokenMint
			)
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}

	tx.add(
		await program.withdrawUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(liquidityTokenAmount),
			index,
		)
	);
	await program.provider.send!(tx);

	return {
    result: true
  }
}

type WithdrawFormData = {
  index: number
  amount: number,
  percent: number
}
interface CallWithdrawProps {
	program: InceptClient
	userPubKey: PublicKey | null
  data: WithdrawFormData
}
export function useWithdrawMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: WithdrawFormData) => callWithdraw({ program: getInceptApp(), userPubKey, data }))
}


export const callDeposit = async ({program, userPubKey, data} : CallDepositProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  	const { index, iassetAmount } = data

	const tokenData = await program.getTokenData();

	let liquidityPositions = await program.getLiquidityPositions();
	let liquidityPosition = liquidityPositions[index]!;

	let iassetMint = tokenData.pools[liquidityPosition.poolIndex].assetInfo.iassetMint
	let liquidityTokenMint = tokenData.pools[liquidityPosition.poolIndex].liquidityTokenMint

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	let tx = new Transaction();

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.publicKey!,
		  );
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.publicKey!,
				liquidityAssociatedToken,
				program.provider.publicKey!,
				liquidityTokenMint
			)
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}
	tx.add(
		await program.provideUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(iassetAmount * 10 ** 8),
			index
		)
	);
	await program.provider.send!(tx, []);
	
	return {
    result: true
  }
}

type DepositFormData = {
  index: number
  iassetAmount: number
}
interface CallDepositProps {
	program: InceptClient
	userPubKey: PublicKey | null
  data: DepositFormData
}
export function useDepositMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: DepositFormData) => callDeposit({ program: getInceptApp(), userPubKey, data }))
}

export const callLiquidity = async ({ program, userPubKey, data }: CallLiquidityProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  	const { iassetIndex, iassetAmount } = data

	const tokenData = await program.getTokenData();

	const pool = tokenData.pools[iassetIndex];

	let iassetMint = pool.assetInfo.iassetMint;
	let liquidityTokenMint = pool.liquidityTokenMint;

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.publicKey!, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.publicKey!, program.provider.connection)

	const tx = new Transaction();

	// let userAccount = await program.getUserAccount();
	// let liquidityPositionAddress = userAccount.liquidityPositions;
	// if (liquidityPositionAddress.equals(PublicKey.default)) {
	// 	const liquidityPositionsAccount = anchor.web3.Keypair.generate();
	// 	signers.push(liquidityPositionsAccount);
	// 	liquidityPositionAddress = liquidityPositionsAccount.publicKey;
	// 	tx.add(
	// 		await program.program.account.liquidityPositions.createInstruction(
	// 			liquidityPositionsAccount
	// 		)
	// 	);
	// 	tx.add(
	// 		await program.initializeLiquidityPositionsInstruction(liquidityPositionsAccount)
	// 	);
	// }
	// const associatedToken = await getAssociatedTokenAddress(liquidityTokenMint, program.provider.publicKey!)
	// if (liquidityAssociatedTokenAccount === undefined) {
	// 	tx.add(
	// 		await createAssociatedTokenAccountInstruction(
	// 			program.provider.publicKey!,
	// 			associatedToken,
	// 			program.provider.publicKey!,
	// 			liquidityTokenMint
	// 		)
	// 	)
	// 	liquidityAssociatedTokenAccount = associatedToken;
	// }

	tx.add(
		await program.provideUnconcentratedLiquidityInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(iassetAmount * 10 ** 8),
			iassetIndex,
		)
	);

	await program.provider.send!(tx);

	return {
    result: true
  }
}

type LiquidityFormData = {
  iassetIndex: number
	iassetAmount: number
}
interface CallLiquidityProps {
	program: InceptClient
	userPubKey: PublicKey | null
  data: LiquidityFormData
}
export function useLiquidityMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: LiquidityFormData) => callLiquidity({ program: getInceptApp(), userPubKey, data }))
}