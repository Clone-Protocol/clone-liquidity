import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { Incept, toDevnetScale } from 'incept-protocol-sdk/sdk/src/incept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const callEdit = async ({ program, userPubKey, data }: CallEditProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('edit input data', data)

	await program.loadManager()

	const [cometResult, tokenDataResult, updatePricesIxResult] = await Promise.allSettled([
		program.getComet(),
		program.getTokenData(),
		program.updatePricesInstruction(),
	])

	if (
		cometResult.status === 'rejected' ||
		tokenDataResult.status === 'rejected' ||
		updatePricesIxResult.status === 'rejected'
	) {
		console.error('Failed to fetch data!')
		return
	}

	const { positionIndex, changeAmount, editType } = data
	const cometPosition = cometResult.value.positions[positionIndex]
	const poolIndex = cometPosition.poolIndex

	let tx = new Transaction().add(updatePricesIxResult.value)
	let ix: TransactionInstruction
	/// Deposit
	if (editType === 0) {
		ix = await program.addLiquidityToCometInstruction(toDevnetScale(changeAmount), poolIndex, false)
		/// Withdraw
	} else {
		const pool = tokenDataResult.value.pools[poolIndex]
		const totalPoolUsdi = toNumber(pool.usdiAmount)
		const totalLpTokens = toNumber(pool.liquidityTokenSupply)
		const lpTokensToWithdraw = Math.min(
			(totalLpTokens * changeAmount) / totalPoolUsdi,
			toNumber(cometPosition.liquidityTokenValue)
		)

		ix = await program.withdrawLiquidityFromCometInstruction(toDevnetScale(lpTokensToWithdraw), positionIndex, false)
	}
	tx.add(ix)

	await program.provider.send!(tx)
}

type EditFormData = {
	positionIndex: number
	changeAmount: number
	editType: number
}
interface CallEditProps {
	program: Incept
	userPubKey: PublicKey | null
	data: EditFormData
}
export function useLiquidityPositionMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(), userPubKey, data }))
}
