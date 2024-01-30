import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}