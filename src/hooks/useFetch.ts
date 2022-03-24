import { useEffect, useRef, useReducer } from 'react';
import { AssetList as AssetListType, FilterType, FilterTypeMap, fetchAssets } from '~/web3/Overview/Assets'

export const useFetch = (program: any, publicKey: any, filter: any, tag: string) => {
	const cache = useRef<any>({})

	const initialState = {
		status: 'idle',
		error: null,
		data: [],
	}

	const [state, dispatch] = useReducer((state: any, action: {type: string, payload?: any }) => {
		switch (action.type) {
			case 'FETCHING':
				return { ...initialState, status: 'fetching' }
			case 'FETCHED':
				return { ...initialState, status: 'fetched', data: action.payload }
			case 'FETCH_ERROR':
				return { ...initialState, status: 'error', error: action.payload }
			default:
				return state
		}
	}, initialState)

	useEffect(() => {
		let cancelRequest = false

		const fetchData = async () => {
			dispatch({ type: 'FETCHING' })
			if (cache.current[tag]) {
				const data = cache.current[tag]
				dispatch({ type: 'FETCHED', payload: data })
			} else {
				try {
					const data = await fetchAssets({
            program,
            userPubKey: publicKey,
            filter,
          })
          if (data.length > 0) {
            cache.current[tag] = data
            if (cancelRequest) return
            dispatch({ type: 'FETCHED', payload: data })
          }
				} catch (error: any) {
					if (cancelRequest) return
					dispatch({ type: 'FETCH_ERROR', payload: error.message })
				}
			}
		};

		fetchData()

		return function cleanup() {
			cancelRequest = true
		}
	}, [tag])

	return state
}