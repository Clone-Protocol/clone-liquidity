import { useEffect } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, createTokenAccountInstruction } from '~/utils/token_accounts'
import { Transaction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor"
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'


export default function useInitialized() {
	const { enqueueSnackbar } = useSnackbar()
	const { connected, publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const [localAccount, setLocalAccount] = useLocalStorage("currentAccount", '')

	useEffect(() => {
		async function getAccount() {			
			if (connected && publicKey && wallet) {
				// for initialize once per each account
				if (localAccount === publicKey.toString()) {
					console.log('the account is already initialized')
					return;
				}

				const program = getInceptApp()
				await program.loadManager()
				if (!program.provider.wallet) {
					return;
				}

				const usdiTokenAccount = await getTokenAccount(program.manager!.usdiMint, publicKey, program.provider.connection);

				try {
					await program.getUserAccount()
					console.log('getUserAccount')
				} catch (error) {
					console.log("error:", error);
					console.log('err', 'Account does not exist')
					let tx = new Transaction();

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
					// tx.add(
					// 	SystemProgram.createAccount({
					// 		fromPubkey: publicKey,
					// 		newAccountPubkey: singlePoolCometsAccount.publicKey,
					// 		space: program.program.account.singlePoolComets.size,
					// 		lamports: await program.provider.connection.getMinimumBalanceForRentExemption(
					// 			program.program.account.singlePoolComets.size
					// 		),
					// 		programId: program.programId,
					// 	})
					// );
					tx.add(
						await program.initializeCometInstruction(
							singlePoolCometsAccount,
							true,
							publicKey
						)
					);
					// tx.add(
					// 	await program.initializeSinglePoolCometsInstruction(
					// 		singlePoolCometsAccount, publicKey
					// 	)
					// );

					try {
						await program.provider.send!(tx, [singlePoolCometsAccount]);

						// store account to localstorage
						console.log('store account')
						setLocalAccount(publicKey.toString())
					} catch (err) {

						console.log(err)
						console.log('err: Attempt to debit an account but found no record of a prior credit.')
						enqueueSnackbar('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
					}
				}
			}
		}
		getAccount()
	}, [connected, publicKey])

	return true
}
