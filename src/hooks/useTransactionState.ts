import { createContext, useContext } from 'react'

export enum TransactionState {
  INIT,
  PRE_PENDING,
  PENDING,
  SUCCESS,
  FAIL,
}

export type TransactionStateType = {
  state: TransactionState,
  txHash: string
}

export interface TransactionStateContextState {
  txState: TransactionStateType
  setTxState: (state: TransactionStateType) => void
}

export const TransactionStateContext = createContext<TransactionStateContextState>({} as TransactionStateContextState)

export function useTransactionState(): TransactionStateContextState {
  return useContext(TransactionStateContext)
}
