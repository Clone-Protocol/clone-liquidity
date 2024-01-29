'use client'
import React, { useEffect, useState } from 'react'
import QueryProvider from '~/hocs/QueryClient'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '~/theme'
import GNB from '~/components/GNB'
import Box from '@mui/material/Box'
import { SnackbarProvider } from 'notistack'
import ClientWalletProvider from '~/hocs/ClientWalletProvider'
import './styles.css'
import { Provider as JotaiProvider } from 'jotai'
import { TransactionStateProvider } from '~/hocs/TransactionStateProvider'
import { IS_COMPLETE_INIT } from '~/data/localstorage'
import useLocalStorage from '~/hooks/useLocalStorage'
import dynamic from 'next/dynamic'
import GlobalError from './global-error'
import ErrorBoundary from '~/components/ErrorBoundary'
import { IS_DEV } from '~/data/networks'

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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta property="og:title" content="Clone Liquidity - Home of the Comet Liquidity System" />
        <meta property="og:url" content="https://liquidity.clone.so/" />
        <meta property="og:image" content="/liquidity-meta-img.png" />
        <meta property="og:image:alt" content="Clone Liquidity" />
        <meta
          property="og:description"
          content="Clone Liquidity enables users to try our pioneering leveraged liquidity system, presenting unique and flexible opportunities for liquidity providers to yield."
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <QueryProvider>
          <JotaiProvider>
            <ThemeProvider theme={theme}>
              <SnackbarProvider maxSnack={3}>
                <ClientWalletProvider>
                  <TransactionStateProvider>
                    <ErrorBoundary fallback={<GlobalError />}>
                      <Box display='flex' sx={{ backgroundColor: '#000' }}>
                        <CssBaseline />
                        <GNB />

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
                        {IS_DEV && isOpenInit && <InitEnterScreen onClose={() => setIsOpenInit(false)} />}
                      </Box>
                    </ErrorBoundary>
                  </TransactionStateProvider>
                </ClientWalletProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </JotaiProvider>
        </QueryProvider>
      </body >
    </html >
  )
}
