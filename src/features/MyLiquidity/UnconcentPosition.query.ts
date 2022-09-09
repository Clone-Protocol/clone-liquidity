import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'

export const fetchUnconcentDetail = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

	await program.loadManager()

	const liquidity = await program.getLiquidityPosition(index)
	const poolIndex = Number(liquidity.poolIndex)

	const balances = await program.getPoolBalances(poolIndex)
	let price = balances[1] / balances[0]

	let usdiVal = 0.0
	let iassetVal = 0.0

	try {
		const associatedTokenAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
    usdiVal = Number(associatedTokenAccount.amount) / 100000000;
	} catch {}

	try {
    const associatedTokenAccount = await program.getOrCreateAssociatedTokenAccount(
      (
        await program.getPool(poolIndex)
      ).assetInfo.iassetMint
    );

    iassetVal =  Number(associatedTokenAccount.amount) / 100000000;
	} catch {}
	
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