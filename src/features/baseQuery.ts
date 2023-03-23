import { TransactionState } from "~/hooks/useTransactionState"

export const funcNoWallet = async () => {
  console.log('no wallet')
  return {
    result: false
  }
}

export const baseCall = async (callFunc: any, setTxState: (state: TransactionState) => void) => {
  setTxState(TransactionState.PENDING)
  try {
    await callFunc()

    setTxState(TransactionState.SUCCESS)
  } catch (e) {
    setTxState(TransactionState.FAIL)
  }
}