import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'

export const fetchUnconcentDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()

	const liquidity = await program.getLiquidityPosition(index)
	const poolIndex = Number(liquidity.poolIndex)

	const balances = await program.getPoolBalances(poolIndex)
	let price = balances[1] / balances[0]

	let usdiVal = 0.0
	let iassetVal = 0.0

	const usdiTokenAccountAddress = await getTokenAccount(program.manager!.usdiMint, program.provider.wallet.publicKey, program.connection);

	if (usdiTokenAccountAddress !== undefined) {
	  const usdiBalance = await program.connection.getTokenAccountBalance(usdiTokenAccountAddress);
	  usdiVal = Number(usdiBalance.value.amount) / 100000000;
	}
  
	const pool = await program.getPool(index);
	const iassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.iassetMint, program.provider.wallet.publicKey, program.connection);
	if (iassetTokenAccountAddress !== undefined) {
	  const iassetBalance = await program.connection.getTokenAccountBalance(iassetTokenAccountAddress);
	  iassetVal = Number(iassetBalance.value.amount) / 100000000;
	}
	
  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(poolIndex)
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
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
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