import { BN, Provider } from '@project-serum/anchor'
import {
	PublicKey,
	Connection,
	Keypair,
	Transaction,
	ConfirmOptions,
	sendAndConfirmRawTransaction,
} from '@solana/web3.js'
import { Value } from './incept'

export const signAndSend = async (
	tx: Transaction,
	signers: Array<Keypair>,
	connection: Connection,
	opts?: ConfirmOptions
) => {
	tx.setSigners(...signers.map((s) => s.publicKey))
	const blockhash = await connection.getLatestBlockhash(opts?.commitment || Provider.defaultOptions().commitment)
	tx.recentBlockhash = blockhash.blockhash
	tx.partialSign(...signers)
	const rawTx = tx.serialize()
	return await sendAndConfirmRawTransaction(connection, rawTx, opts || Provider.defaultOptions())
}

export const sleep = async (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export const mul = (value1: Value, value2: Value) => {
	return { val: value1.val.mul(value2.val).div(new BN(Math.pow(10, value2.scale))), scale: value1.scale } as Value
}

export const div = (value1: Value, value2: Value) => {
	return { val: value1.val.mul(new BN(Math.pow(10, value2.scale))).div(value2.val), scale: value1.scale } as Value
}

export const toScaledNumber = (value: Value) => {
	return Number(value.val.div(new BN(Math.pow(10, value.scale))))
}
