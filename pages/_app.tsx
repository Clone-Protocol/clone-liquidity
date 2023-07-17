import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'
import QueryProvider from '~/hocs/QueryClient'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '~/theme'
import GNB from '~/components/GNB'
import Drawer from '~/components/Drawer'
import Box from '@mui/material/Box'
import { SnackbarProvider } from 'notistack'
import { NextPage } from 'next'
import ClientWalletProvider from '~/hocs/ClientWalletProvider'
import { DataLoadingIndicatorProvider } from '~/hocs/DataLoadingIndicatorProvider'
import './styles.css'
import { Provider as JotaiProvider } from 'jotai'
import { TransactionStateProvider } from '~/hocs/TransactionStateProvider'
import { IS_COMPLETE_INIT } from '~/data/localstorage'
import useLocalStorage from '~/hooks/useLocalStorage'
import dynamic from 'next/dynamic'

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const [isCompleteInit, _] = useLocalStorage(IS_COMPLETE_INIT, false)
  const [isOpenInit, setIsOpenInit] = useState(false)
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
                      {getLayout(<Component {...pageProps} />)}
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
  )
}

type NextPageWithLayout = NextPage & {
  // eslint-disable-next-line no-unused-vars
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default MyApp
