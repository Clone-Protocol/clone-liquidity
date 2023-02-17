import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal"

export const fetchUnconcentDetail = async ({ program, userPubKey, index }: { program: InceptClient, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()
	const tokenData = await program.getTokenData()

	const liquidity = (await program.getLiquidityPositions())[index]
	const pool = tokenData.pools[liquidity.poolIndex];

	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
	let usdiVal = 0.0
	let iassetVal = 0.0

	const usdiTokenAccountAddress = await getTokenAccount(program.incept!.usdiMint, program.provider.publicKey!, program.connection);

	if (usdiTokenAccountAddress !== undefined) {
	  const usdiBalance = await program.connection.getTokenAccountBalance(usdiTokenAccountAddress, "processed");
	  usdiVal = Number(usdiBalance.value.amount) / 100000000;
	}
  
	const iassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.iassetMint, program.provider.publicKey!, program.connection);
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
  const { getInceptApp } = useIncept()
  return useQuery(['unconcentDetail', userPubKey, index], () => fetchUnconcentDetail({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}