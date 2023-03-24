import * as anchor from "@project-serum/anchor";
import { Transaction } from "@solana/web3.js";
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept";
import { TransactionStateType, TransactionState } from "~/hooks/useTransactionState"

export const sendAndConfirm = async (incept: InceptClient, tx: Transaction, signers: anchor.web3.Keypair[], setTxState: (state: TransactionStateType) => void) => {
  //@TODO: we need to set txState as pending when transaction is confirming. not when the approval pop-up pops up like now
  // const txHash = await incept.provider.send(tx, signers);
  setTxState({ state: TransactionState.PENDING, txHash: '' })
  try {
    //confirmTransaction(txHash, incept.provider, signers);
    const txHash = await incept.provider.sendAndConfirm!(tx, signers);
    console.log('txHash', txHash)
    setTxState({ state: TransactionState.SUCCESS, txHash })
  } catch (e: any) {
    //@TODO: put txHash on failed event
    setTxState({ state: TransactionState.FAIL, txHash: '' })
    throw new Error(e)
  }
}