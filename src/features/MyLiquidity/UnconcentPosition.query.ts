import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal"
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchUnconcentDetail = async ({ program, userPubKey, index }: { program: CloneClient, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadClone()
	const tokenData = await program.getTokenData()

	const liquidity = (await program.getLiquidityPositions())[index]
	const pool = tokenData.pools[liquidity.poolIndex];

	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
	let usdiVal = 0.0
	let iassetVal = 0.0

	const usdiTokenAccountAddress = await getTokenAccount(program.clone!.onusdMint, program.provider.publicKey!, program.connection);

	if (usdiTokenAccountAddress !== undefined) {
		const usdiBalance = await program.connection.getTokenAccountBalance(usdiTokenAccountAddress, "processed");
		usdiVal = Number(usdiBalance.value.amount) / 100000000;
	}

	const iassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.onassetMint, program.provider.publicKey!, program.connection);
	if (iassetTokenAccountAddress !== undefined) {
		const iassetBalance = await program.connection.getTokenAccountBalance(iassetTokenAccountAddress, "processed");
		iassetVal = Number(iassetBalance.value.amount) / 100000000;
	}

	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(liquidity.poolIndex)
	return {
		tickerIcon,
		tickerName,
		tickerSymbol,
		price,
		usdiVal,
		iassetVal,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export interface UnconcentratedData {
	borrowFrom: number
	borrowTo: number
}

export function useUnconcentDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	if (wallet) {
		return useQuery(['unconcentDetail', wallet, userPubKey, index], () => fetchUnconcentDetail({ program: getCloneApp(wallet), userPubKey, index }), {
			refetchOnMount,
			enabled
		})
	} else {
		return useQuery(['unconcentDetail'], () => { })
	}
}