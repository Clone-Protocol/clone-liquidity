'use client'
import React, { useEffect, useState } from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'
import QueryProvider from '~/hocs/QueryClient'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '~/theme'
import GNB from '~/components/GNB'
import Drawer from '~/components/Drawer'
import Box from '@mui/material/Box'
import { SnackbarProvider } from 'notistack'
import ClientWalletProvider from '~/hocs/ClientWalletProvider'
import { DataLoadingIndicatorProvider } from '~/hocs/DataLoadingIndicatorProvider'
import './styles.css'
import { Provider as JotaiProvider } from 'jotai'
import { TransactionStateProvider } from '~/hocs/TransactionStateProvider'
import { IS_COMPLETE_INIT } from '~/data/localstorage'
import useLocalStorage from '~/hooks/useLocalStorage'
import dynamic from 'next/dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCompleteInit, _] = useLocalStorage(IS_COMPLETE_INIT, false)
  const [isOpenInit, setIsOpenInit] = useState(false)
  const InitEnterScreen = dynamic(() => import('~/components/Common/InitEnterScreen'), { ssr: false })

  useEffect(() => {
    if (!isCompleteInit) {
      setIsOpenInit(true)
    }
  }, [isCompleteInit])

  return (
    <html lang="en">
      <head>
        <title>Clone Liquidity - Home of the Comet Liquidity System</title>
        <meta name="description" content="Clone Liquidity enables users to try our pioneering leveraged liquidity system, presenting unique and flexible opportunities for liquidity providers to yield." />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <QueryProvider>
          <JotaiProvider>
            <ThemeProvider theme={theme}>
              <SnackbarProvider maxSnack={3}>
                <ClientWalletProvider>
                  <TransactionStateProvider>
                    <DataLoadingIndicatorProvider>
                      <Box display='flex' sx={{ backgroundColor: '#000' }}>
                        <CssBaseline />
                        <GNB />
                        <Drawer />

                        <Box
                          component="main"
                          sx={{
                            flexGrow: 1,
                            height: '100vh',
                            overflow: 'auto',
                            overscrollBehaviorY: 'contain'
                          }}>
                          {children}
                        </Box>
                        {isOpenInit && <InitEnterScreen onClose={() => setIsOpenInit(false)} />}
                      </Box>
                    </DataLoadingIndicatorProvider>
                  </TransactionStateProvider>
                </ClientWalletProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </JotaiProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider>
      </body>
    </html>
  )
}
