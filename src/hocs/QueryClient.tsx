import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	const [queryClient] = useState(new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				suspense: true,
			},
		},
	}))

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}

export default QueryProvider
