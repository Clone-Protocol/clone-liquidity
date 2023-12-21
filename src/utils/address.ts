import { LAMPORTS_PER_SOL, clusterApiUrl, PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'

export const shortenAddress = (address: string) => {
	return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export const getSolInBalance = async (publicKey: PublicKey) => {
	const SOLANA_HOST = clusterApiUrl("devnet")
	const connection = new anchor.web3.Connection(SOLANA_HOST)

	let lamportBalance
	const balance = await connection.getBalance(publicKey)
	lamportBalance = (balance / LAMPORTS_PER_SOL)
	return lamportBalance
}