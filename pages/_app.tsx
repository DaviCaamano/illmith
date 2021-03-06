import React from 'react';
import Head from 'next/head';
import { store } from '@contexts/redux';
import { CookiesProvider } from 'react-cookie';

//presets
import { chakraTheme, ChakraProvider } from '@styles/chakra-theme';

//contexts
import { Alert } from '@contexts';
import { Provider } from 'react-redux';
import { User } from '@components/user';

//types
import type { AppProps } from 'next/app';

//css
import '@styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Illmith</title>
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
      </Head>
      <ChakraProvider theme={chakraTheme}>
        <CookiesProvider>
          <Provider store={store}>
            <Alert>
              <Component {...pageProps} />
            </Alert>
            <User />
          </Provider>
        </CookiesProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
