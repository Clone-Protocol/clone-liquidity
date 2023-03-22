import React, { FC, useState } from 'react'
import { TransactionStateContext, TransactionState } from '~/hooks/useTransactionState'
import TransactionStateSnackbar from '~/components/Common/TransactionStateSnackbar'

export const TransactionStateProvider: FC = ({ children, ...props }) => {
  const [txState, setTxState] = useState(TransactionState.INIT)
  // const [showSnackbar, setShowSnackbar] = useState(true)

  return (
    <TransactionStateContext.Provider
      value={{
        txState,
        setTxState,
      }}>
      {children}

      {txState !== TransactionState.INIT &&
        <TransactionStateSnackbar txState={txState} txHash={''} open={true} handleClose={() => { setTxState(TransactionState.INIT) }} />
      }
    </TransactionStateContext.Provider>
  )
}
