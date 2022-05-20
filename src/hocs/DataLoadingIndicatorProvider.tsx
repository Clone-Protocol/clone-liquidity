import React, { FC, useState } from 'react'
import { DataLoadingContext } from '~/hooks/useDataLoading'

export const DataLoadingIndicatorProvider: FC = ({ children, ...props }) => {
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
