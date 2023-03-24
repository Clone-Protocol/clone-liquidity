// import * as anchor from "@project-serum/anchor";
import { Transaction, Signer } from "@solana/web3.js";
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept";
import { TransactionStateType, TransactionState } from "~/hooks/useTransactionState"

export const sendAndConfirm = async (incept: InceptClient, tx: Transaction, signers: Signer[], setTxState: (state: TransactionStateType) => void) => {
  //@TODO: we need to set txState as pending when transaction is confirming. not when the approval pop-up pops up like now
  // const txHash = await incept.provider.send(tx, signers);
  const {blockhash, lastValidBlockHeight} = await incept.provider.connection.getLatestBlockhash();
  let updatedTx = new Transaction({blockhash, lastValidBlockHeight}) as Transaction;
  tx.instructions.forEach(ix => updatedTx.add(ix));

  setTxState({ state: TransactionState.INIT, txHash: '' })
  let txHash = ''
  try {
    txHash = await incept.provider.sendAndConfirm!(updatedTx, signers, {commitment: 'processed'})
    console.log('txHash', txHash)
    setTxState({ state: TransactionState.PENDING, txHash })
  
    await incept.provider.connection.confirmTransaction({
      blockhash, lastValidBlockHeight, signature: txHash,
    }, 'finalized')
    setTxState({ state: TransactionState.SUCCESS, txHash })

  } catch (e: any) {
    //@TODO: put txHash on failed event
    setTxState({ state: TransactionState.FAIL, txHash })
    throw new Error(e)
  }
}