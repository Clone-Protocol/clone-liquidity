import { useWallet } from '@solana/wallet-adapter-react'
import * as anchor from "@project-serum/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, createTokenAccountInstruction } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"

export const createAccount = (): Promise<void> => {
	const { getInceptApp } = useIncept()
	const { publicKey } = useWallet()

	return new Promise(async (resolve, reject) => {
		const program = getInceptApp()
		await program.loadManager()

		let tx = new Transaction();
		const usdiTokenAccount = await getTokenAccount(program.manager!.usdiMint, publicKey, program.provider.connection); 
	
		if (usdiTokenAccount === undefined) {
			console.log("NO USDI ACCOUNT!")
			const associatedToken = await getAssociatedTokenAddress(
				program.manager!.usdiMint,
				publicKey
			);

			tx.add(
				createAssociatedTokenAccountInstruction(
					publicKey,
					associatedToken,
					publicKey,
					program.manager!.usdiMint
				)
			);
		}

		tx.add(
			await program.initializeUserInstruction(publicKey)
		);

		// TODO: Figure out where to move this since it's a temporary solution.
		const singlePoolCometsAccount = anchor.web3.Keypair.generate();
		tx.add(
			await program.initializeCometInstruction(
				singlePoolCometsAccount,
				true,
				publicKey
			)
		);

		const multiPoolCometsAccount = anchor.web3.Keypair.generate();
		tx.add(
			await program.initializeCometInstruction(
				multiPoolCometsAccount,
				false,
				publicKey
			)
		);

		try {
			await program.provider.send!(tx, [singlePoolCometsAccount, multiPoolCometsAccount]);

			// store account to localstorage
			console.log('store account')
			setLocalAccount(publicKey.toString())
			resolve()
		} catch (err) {
			console.log(err)
			console.log('err: Attempt to debit an account but found no record of a prior credit.')
			reject('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
		}

	})
}