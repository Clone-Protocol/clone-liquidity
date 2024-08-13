//layout for page-router
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
import { Provider as JotaiProvider } from 'jotai'
import { TransactionStateProvider } from '~/hocs/TransactionStateProvider'
import { IS_COMPLETE_INIT } from '~/data/localstorage'
import useLocalStorage from '~/hooks/useLocalStorage'
import dynamic from 'next/dynamic'
import ErrorBoundary from '~/components/ErrorBoundary'
import { IS_DEV } from '~/data/networks'
import BannerMarkets from './Common/BannerMarkets'
import ShutdownDialog from './Common/ShutdownDialog'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCompleteInit, _] = useLocalStorage(IS_COMPLETE_INIT, false)
  const [isOpenInit, setIsOpenInit] = useState(false)
  const [isOpenBanner, setIsOpenBanner] = useState(true)
  const [isOpenShutdownDlog, setIsOpenShutdownDlog] = useState(true)
  const InitEnterScreen = dynamic(() => import('~/components/Common/InitEnterScreen'), { ssr: false })

  useEffect(() => {
    if (!isCompleteInit) {
      setIsOpenInit(true)
    }
  }, [isCompleteInit])

  return (
    <QueryProvider>
      <JotaiProvider>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3}>
            <ClientWalletProvider>
              <TransactionStateProvider>
                <ErrorBoundary>
                  <Box display='flex' sx={{ backgroundColor: '#000' }}>
                    <CssBaseline />
                    <GNB />

                    <Box
                      component="main"
                      sx={{
                        pt: '25px',
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                        overscrollBehaviorY: 'contain'
                      }}>
                      {children}
                    </Box>

                    <ShutdownDialog open={isOpenShutdownDlog} handleClose={() => setIsOpenShutdownDlog(false)} />
                    {/* {IS_DEV && isOpenInit && <InitEnterScreen onClose={() => setIsOpenInit(false)} />} */}

                    {/* <BannerMarkets open={isOpenBanner} handleClose={() => setIsOpenBanner(false)} /> */}
                  </Box>
                </ErrorBoundary>
              </TransactionStateProvider>
            </ClientWalletProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </JotaiProvider>
    </QueryProvider>
  )
}
