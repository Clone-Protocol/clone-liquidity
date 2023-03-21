import { createContext, useContext } from 'react'

export enum TransactionState {
  INIT,
  PENDING,
  SUCCESS,
  FAIL,
}

export interface TransactionStateContextState {
  txState: TransactionState
  setTxState: (state: TransactionState) => void
}

export const TransactionStateContext = createContext<TransactionStateContextState>({} as TransactionStateContextState)

export function useTransactionState(): TransactionStateContextState {
  return useContext(TransactionStateContext)
}
