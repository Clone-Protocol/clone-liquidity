import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			suspense: true,
		},
	},
})

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider
