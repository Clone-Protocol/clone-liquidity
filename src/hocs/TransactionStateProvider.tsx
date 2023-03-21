import React, { FC, useState } from 'react'
import { TransactionStateContext, TransactionState } from '~/hooks/useTransactionState'
import TransactionStateSnackbar from '~/components/Common/TransactionStateSnackbar'

export const TransactionStateProvider: FC = ({ children, ...props }) => {
  const [txState, setTxState] = useState(TransactionState.INIT)

  return (
    <TransactionStateContext.Provider
      value={{
        txState,
        setTxState,
      }}>
      {children}

      {/* <TransactionStateSnackbar open={true} handleClose={() => { return null }} /> */}
    </TransactionStateContext.Provider>
  )
}
