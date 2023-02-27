import { useEffect, useState } from 'react'
import { User, Comet, LiquidityPositions, MintPositions } from 'incept-protocol-sdk/sdk/src/incept'
import { useLoadedIncept } from './useLoadedIncept'

export interface UserState {
	user?: User
	comet?: Comet
	singlePoolComet?: Comet
	liquidityPositions?: LiquidityPositions
	mintPositions?: MintPositions
}

export const useUserState = () => {
	const incept = useLoadedIncept()
	const [reloadUserState, setReloadUserState] = useState(true)
	const [userState, setUserState] = useState<UserState | undefined>(undefined)

	useEffect(() => {
		const loadUserState = async () => {
			const [userResult, cometResult, singlePoolCometResult, liquidityPositionsResult, mintPositionsResult] =
				await Promise.allSettled([
					await incept!.getUserAccount(),
					await incept!.getComet(),
					await incept!.getSinglePoolComets(),
					await incept!.getLiquidityPositions(),
					await incept!.getBorrowPositions(),
				])
			const getValueElseUndefined = <Type>(result: PromiseSettledResult<Type>): Type | undefined => {
				return result.status == 'fulfilled' ? result.value : undefined
			}
			setUserState({
				user: getValueElseUndefined(userResult),
				comet: getValueElseUndefined(cometResult),
				singlePoolComet: getValueElseUndefined(singlePoolCometResult),
				liquidityPositions: getValueElseUndefined(liquidityPositionsResult),
				mintPositions: getValueElseUndefined(mintPositionsResult),
			} as UserState)
			setReloadUserState(false)
		}
		if (reloadUserState && incept !== undefined) {
			loadUserState().catch(console.error)
            console.log("LOADED USER STATE!");
		}
	}, [reloadUserState, incept])

	return { setReloadUserState, userState }
}
