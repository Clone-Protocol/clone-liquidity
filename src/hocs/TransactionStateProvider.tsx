import React, { useState } from 'react'
import { TransactionStateContext, TransactionState } from '~/hooks/useTransactionState'
import TransactionStateSnackbar from '~/components/Common/TransactionStateSnackbar'

export const TransactionStateProvider = ({ children, ...props }: any) => {
  const [txState, setTxState] = useState({
    state: TransactionState.INIT,
    txHash: '',
  })

  return (
    <TransactionStateContext.Provider
      value={{
        txState,
        setTxState,
      }}>
      {children}

      {txState.state !== TransactionState.INIT &&
        <TransactionStateSnackbar txState={txState.state} txHash={txState.txHash} open={true} handleClose={() => { setTxState({ state: TransactionState.INIT, txHash: '' }) }} />
      }
    </TransactionStateContext.Provider>
  )
}
