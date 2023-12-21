import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { atom } from 'jotai'
import { DEV_RPCs, IS_DEV, MAIN_RPCs } from '~/data/networks'
import { CreateAccountDialogStates } from '~/utils/constants'

export const mintUSDi = atom(false)

export const syncFetchNetworkState = atom(false)

export const isAlreadyInitializedAccountState = atom(true)

export const createAccountDialogState = atom(CreateAccountDialogStates.Closed)

export const declinedAccountCreationState = atom(false)

export const isCreatingAccountState = atom(false)

export const openConnectWalletGuideDlogState = atom(false)

export const connectedPubKey = atom('')

export const cloneClient = atom<CloneClient | null>(null)

export const rpcEndpointIndex = atom(0)

export const rpcEndpoint = atom(IS_DEV ? DEV_RPCs[0].rpc_url : MAIN_RPCs[0].rpc_url)