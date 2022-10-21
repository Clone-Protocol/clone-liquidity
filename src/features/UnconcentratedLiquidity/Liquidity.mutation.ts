import { PublicKey, Transaction } from '@solana/web3.js'
import { useMutation } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { getMantissa } from "incept-protocol-sdk/sdk/src/decimal";
import * as anchor from "@project-serum/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, getUSDiAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { initial } from 'lodash';

export const callWithdraw = async ({program, userPubKey, data} : CallWithdrawProps) => {
	if (!userPubKey) throw new Error('no user public key')

	await program.loadManager()
  	const { index, amount } = data

	let liquidityPosition = await program.getLiquidityPosition(index)

	let pool = await program.getPool(liquidityPosition.poolIndex)

	let liquidityTokenSupplyBeforeComet = (
		await program.connection.getTokenSupply(pool.liquidityTokenMint, "processed")
	).value!.uiAmount

	let balances = await program.getPoolBalances(liquidityPosition.poolIndex)

	let liquidityTokenAmount = ((amount / 2) * liquidityTokenSupplyBeforeComet!) / balances[1]

	let iassetMint = (await program.getAssetInfo(liquidityPosition.poolIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(liquidityPosition.poolIndex)).liquidityTokenMint

	let iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);
	let collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.wallet.publicKey, program.provider.connection)
	const singlePoolComets = await program.getSinglePoolComets();

	if (iassetAssociatedTokenAccount === undefined || collateralAssociatedTokenAccount === undefined || liquidityAssociatedTokenAccount === undefined) {
		let tx = new Transaction().add(
			await program.paySinglePoolCometILDInstruction(
				data.index,
				getMantissa(singlePoolComets.collaterals[index].collateralAmount)
			)	
		);
		
		if (iassetAssociatedTokenAccount === undefined) {
			const iAssetAssociatedToken: PublicKey = await getAssociatedTokenAddress(
				iassetMint,
				program.provider.wallet.publicKey,
			  );
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.wallet.publicKey,
					iAssetAssociatedToken,
					program.provider.wallet.publicKey,
					iassetMint
				)
			);
			iassetAssociatedTokenAccount = iAssetAssociatedToken;
		}
		if (collateralAssociatedTokenAccount === undefined) {
			const usdiAssociatedToken = await getAssociatedTokenAddress(
				program.manager!.usdiMint,
				program.provider.wallet.publicKey,
			  );
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.wallet.publicKey,
					usdiAssociatedToken,
					program.provider.wallet.publicKey,
					program.manager!.usdiMint
				)
			);
			collateralAssociatedTokenAccount = usdiAssociatedToken;
		}

		if (liquidityAssociatedTokenAccount === undefined) {
			const liquidityAssociatedToken = await getAssociatedTokenAddress(
				liquidityTokenMint,
				program.provider.wallet.publicKey,
			  );
			tx.add(
				await createAssociatedTokenAccountInstruction(
					program.provider.wallet.publicKey,
					liquidityAssociatedToken,
					program.provider.wallet.publicKey,
					liquidityTokenMint
				)
			);
			liquidityAssociatedTokenAccount = liquidityAssociatedToken;
		}

		tx.add(
			await program.withdrawLiquidityInstruction(
				collateralAssociatedTokenAccount!,
				iassetAssociatedTokenAccount!,
				liquidityAssociatedTokenAccount!,
				new anchor.BN(liquidityTokenAmount * 10 ** 8),
				index,
			)
		);
		await program.provider.send!(tx);

	} else {
		await program.withdrawLiquidity(
			new anchor.BN(liquidityTokenAmount * 10 ** 8),
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			index,
			[]
		)
	}

	return {
    result: true
  }
}

type WithdrawFormData = {
  index: number
  amount: number
}
interface CallWithdrawProps {
	program: Incept
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

	let liquidityPosition = await program.getLiquidityPosition(index)

	let iassetMint = (await program.getAssetInfo(liquidityPosition.poolIndex)).iassetMint
	let liquidityTokenMint = (await program.getPool(liquidityPosition.poolIndex)).liquidityTokenMint

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.wallet.publicKey, program.provider.connection)

	let tx = new Transaction();

	if (liquidityAssociatedTokenAccount === undefined) {
		const liquidityAssociatedToken = await getAssociatedTokenAddress(
			liquidityTokenMint,
			program.provider.wallet.publicKey,
		  );
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.wallet.publicKey,
				liquidityAssociatedToken,
				program.provider.wallet.publicKey,
				liquidityTokenMint
			)
		);
		liquidityAssociatedTokenAccount = liquidityAssociatedToken;
	}
	tx.add(
		await program.provideLiquidityInstruction(
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
	program: Incept
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

	const pool = await program.getPool(iassetIndex);

	let iassetMint = pool.assetInfo.iassetMint;
	let liquidityTokenMint = pool.liquidityTokenMint;
	let signers = [];

	const iassetAssociatedTokenAccount = await getTokenAccount(iassetMint, program.provider.wallet.publicKey, program.provider.connection);
	const collateralAssociatedTokenAccount = await getUSDiAccount(program);
	let liquidityAssociatedTokenAccount = await getTokenAccount(liquidityTokenMint, program.provider.wallet.publicKey, program.provider.connection)

	const tx = new Transaction();

	let userAccount = await program.getUserAccount();
	let liquidityPositionAddress = userAccount.liquidityPositions;
	if (liquidityPositionAddress.equals(PublicKey.default)) {
		const liquidityPositionsAccount = anchor.web3.Keypair.generate();
		signers.push(liquidityPositionsAccount);
		liquidityPositionAddress = liquidityPositionsAccount.publicKey;
		tx.add(
			await program.program.account.liquidityPositions.createInstruction(
				liquidityPositionsAccount
			)
		);
		tx.add(
			await program.initializeLiquidityPositionsInstruction(liquidityPositionsAccount)
		);
	}
	const associatedToken = await getAssociatedTokenAddress(liquidityTokenMint, program.provider.wallet.publicKey)
	if (liquidityAssociatedTokenAccount === undefined) {
		tx.add(
			await createAssociatedTokenAccountInstruction(
				program.provider.wallet.publicKey,
				associatedToken,
				program.provider.wallet.publicKey,
				liquidityTokenMint
			)
		)
		liquidityAssociatedTokenAccount = associatedToken;
	}

	tx.add(
		await program.initializeLiquidityPositionInstruction(
			collateralAssociatedTokenAccount!,
			iassetAssociatedTokenAccount!,
			liquidityAssociatedTokenAccount!,
			new anchor.BN(iassetAmount * 10 ** 8),
			iassetIndex,
			liquidityPositionAddress
		)
	);

	await program.provider.send!(tx, signers);

	// await program.initializeLiquidityPosition(
	// 	new anchor.BN(iassetAmount * 10 ** 8),
	// 	collateralAssociatedTokenAccount!,
	// 	iassetAssociatedTokenAccount!,
	// 	liquidityAssociatedTokenAccount!,
	// 	iassetIndex,
	// 	[]
	// )

	return {
    result: true
  }
}

type LiquidityFormData = {
  iassetIndex: number
	iassetAmount: number
}
interface CallLiquidityProps {
	program: Incept
	userPubKey: PublicKey | null
  data: LiquidityFormData
}
export function useLiquidityMutation(userPubKey : PublicKey | null ) {
  const { getInceptApp } = useIncept()
  return useMutation((data: LiquidityFormData) => callLiquidity({ program: getInceptApp(), userPubKey, data }))
}