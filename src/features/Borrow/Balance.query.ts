import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getTokenAccount } from '~/utils/token_accounts'

export const fetchBalance = async ({ program, userPubKey, index, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void}) => {
	if (!userPubKey) return null

  console.log('fetchBalance')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()

	let usdiVal = 0.0
	let iassetVal = 0.0

  const usdiTokenAccountAddress = await getTokenAccount(program.manager!.usdiMint, userPubKey, program.connection);

  if (usdiTokenAccountAddress !== undefined) {
    const usdiBalance = await program.connection.getTokenAccountBalance(usdiTokenAccountAddress, "processed");
    usdiVal = Number(usdiBalance.value.amount) / 100000000;
  }

  const pool = await program.getPool(index);
  const iassetTokenAccountAddress = await getTokenAccount(pool.assetInfo.iassetMint, userPubKey, program.connection);
  if (iassetTokenAccountAddress !== undefined) {
    const iassetBalance = await program.connection.getTokenAccountBalance(iassetTokenAccountAddress, "processed");
    iassetVal = Number(iassetBalance.value.amount) / 100000000;
  }

	return {
		usdiVal,
		iassetVal,
    usdiTokenAccountAddress,
    iassetTokenAccountAddress
	}
}

interface GetProps {
  userPubKey: PublicKey | null
  index: number
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface Balance {
	usdiVal: number
	iassetVal: number
}

export function useBalanceQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()
  
  return useQuery(['borrowBalance', userPubKey, index], () => fetchBalance({ program: getInceptApp(), userPubKey, index, setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}