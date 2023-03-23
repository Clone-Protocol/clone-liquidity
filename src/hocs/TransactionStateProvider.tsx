import React, { FC, useState } from 'react'
import { TransactionStateContext, TransactionState } from '~/hooks/useTransactionState'
import TransactionStateSnackbar from '~/components/Common/TransactionStateSnackbar'

export const TransactionStateProvider: FC = ({ children, ...props }) => {
  const [txState, setTxState] = useState({
    state: TransactionState.INIT,
    txHash: '',
  })
  // const [showSnackbar, setShowSnackbar] = useState(true)

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
