import { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useSnackbar } from 'notistack'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { TransactionInstruction } from "@solana/web3.js";
import { useClone } from '~/hooks/useClone'
import { getTokenAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'
import { CURRENT_ACCOUNT } from '~/data/localstorage';
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState } from '~/features/globalAtom'
import { useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export function useCreateAccount() {
	const [isCreatingAccount, setIsCreatingAccount] = useAtom(isCreatingAccountState)
	const { getCloneApp } = useClone()
	const { publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const [_, setLocalAccount] = useLocalStorage(CURRENT_ACCOUNT, '')
	const setCreateAccountDialogStatus = useSetAtom(createAccountDialogState)
	const setDeclinedAccountCreation = useSetAtom(declinedAccountCreationState)
	const { enqueueSnackbar } = useSnackbar()
	const { setTxState } = useTransactionState()

	useEffect(() => {
		async function createAccount() {
			if (wallet) {
				try {
					const program = await getCloneApp(wallet, true)

					let ixnCalls: Promise<TransactionInstruction>[] = []

					const onusdTokenAccount = await getTokenAccount(program.clone.collateral.mint, publicKey!, program.provider.connection);
					const associatedToken = await getAssociatedTokenAddress(
						program.clone.collateral.mint,
						publicKey!
					);

					if (onusdTokenAccount === undefined) {
						ixnCalls.push(
							(async () => createAssociatedTokenAccountInstruction(
								publicKey!,
								associatedToken,
								publicKey!,
								program.clone.collateral.mint
							))()
						)
					}

					ixnCalls.push(
						(async () =>
							program.initializeUserInstruction()
						)()
					)

					let ixns = await Promise.all(ixnCalls)
					await sendAndConfirm(program.provider, ixns, setTxState)

					// store account to localstorage
					console.log('store account')
					setLocalAccount(publicKey!.toString())
					setCreateAccountDialogStatus(CreateAccountDialogStates.Closed)
					//hacky sync
					location.reload()
				} catch (err) {
					console.log(err)
					console.log('err: Attempt to debit an account but found no record of a prior credit.')
					setDeclinedAccountCreation(true)
					enqueueSnackbar('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
				} finally {
					setIsCreatingAccount(false)
				}
			}
		}

		if (isCreatingAccount) {
			createAccount()
		}

	}, [wallet, isCreatingAccount])
}
