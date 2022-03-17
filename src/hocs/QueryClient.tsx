import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
		},
	},
})

const QueryProvider: React.FC = ({ children }) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider
