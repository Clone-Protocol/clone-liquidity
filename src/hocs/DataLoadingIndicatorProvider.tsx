import React, { useState } from 'react'
import { DataLoadingContext } from '~/hooks/useDataLoading'

export const DataLoadingIndicatorProvider = ({ children, ...props }: any) => {
	const [startTimer, setStartTimer] = useState(false)

	return (
		<DataLoadingContext.Provider
			value={{
				startTimer,
				setStartTimer,
			}}>
			{children}
		</DataLoadingContext.Provider>
	)
}
