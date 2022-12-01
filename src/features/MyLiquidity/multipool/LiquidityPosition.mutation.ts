import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useIncept } from '~/hooks/useIncept'
import { useMutation } from 'react-query'
import { Incept, toDevnetScale } from 'incept-protocol-sdk/sdk/src/incept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'


export const callNew = async ({ program, userPubKey, data }: CallNewProps) => {
	if (!userPubKey) throw new Error('no user public key')

	console.log('new input data', data)

	await program.loadManager()

	// TODO: make Establish new Liquidity logic
	let tx = new Transaction().add(await program.updatePricesInstruction())
	tx.add(await program.addLiquidityToCometInstruction(toDevnetScale(data.changeAmount), data.poolIndex, false))
    await program.provider.send!(tx);

	return {
    result: true
  }
}

type NewFormData = {
	poolIndex: number
	changeAmount: number
	editType: number
}
interface CallNewProps {
	program: Incept
	userPubKey: PublicKey | null
	data: NewFormData
}
export function useNewPositionMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: NewFormData) => callNew({ program: getInceptApp(), userPubKey, data }))
}


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
	/// Deposit
	if (editType === 0) {
		tx.add(await program.addLiquidityToCometInstruction(toDevnetScale(changeAmount), poolIndex, false))
		/// Withdraw
	} else {
		const pool = tokenDataResult.value.pools[poolIndex]
		const totalPoolUsdi = toNumber(pool.usdiAmount)
		const totalLpTokens = toNumber(pool.liquidityTokenSupply)
        const positionLpTokens = toNumber(cometPosition.liquidityTokenValue);
		const lpTokensToWithdraw = Math.min(
			(totalLpTokens * changeAmount) / totalPoolUsdi,
			positionLpTokens
		)

		tx.add(await program.withdrawLiquidityFromCometInstruction(toDevnetScale(lpTokensToWithdraw), positionIndex, false))

        if (lpTokensToWithdraw === positionLpTokens) {
            const collateralUsdi = toNumber(cometResult.value.collaterals[0].collateralAmount)
            tx.add(await program.payCometILDInstruction(positionIndex, 0, collateralUsdi, false))
        }
	}

	await program.provider.send!(tx)

	return {
    result: true
  }
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
export function useEditPositionMutation(userPubKey: PublicKey | null) {
	const { getInceptApp } = useIncept()
	return useMutation((data: EditFormData) => callEdit({ program: getInceptApp(), userPubKey, data }))
}
