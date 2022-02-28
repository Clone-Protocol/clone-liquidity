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

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', backgroundColor: '#000' }}>
          <CssBaseline />
          <GNB />
          <Drawer />

          <SnackbarProvider maxSnack={3}>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
              }}
            >
              {getLayout(<Component {...pageProps} />)}
            </Box>
          </SnackbarProvider>
        </Box>
      </ThemeProvider>
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
