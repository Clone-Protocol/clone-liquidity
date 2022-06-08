import { useState, useEffect } from 'react'

const useDebounce = (initValue?: string, delay = 500) => {
	const [debounceValue, setDebounceValue] = useState(initValue)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebounceValue(initValue)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [initValue, delay])

	return debounceValue
}

export default useDebounce
