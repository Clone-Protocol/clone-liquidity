import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'

export const shortenAddress = (address: string) => {
	return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export const getSolInBalance = async (program: CloneClient, publicKey: PublicKey) => {
	const connection = program.provider.connection
	const balance = await connection.getBalance(publicKey)
	const lamportBalance = (balance / LAMPORTS_PER_SOL)
	return lamportBalance
}