import { atom } from 'jotai'
import { CreateAccountDialogStates } from '~/utils/constants'

export const syncFetchNetworkState = atom(false)

export const isAlreadyInitializedAccountState = atom(true)

export const createAccountDialogState = atom(CreateAccountDialogStates.Closed)

export const declinedAccountCreationState = atom(false)

export const isCreatingAccountState = atom(false)

export const openConnectWalletGuideDlogState = atom(false)